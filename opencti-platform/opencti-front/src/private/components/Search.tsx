import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { graphql } from 'react-relay';
import {
  SearchStixCoreObjectsLinesPaginationQuery,
  SearchStixCoreObjectsLinesPaginationQuery$variables,
} from '@components/__generated__/SearchStixCoreObjectsLinesPaginationQuery.graphql';
import { SearchStixCoreObjectsLines_data$data } from '@components/__generated__/SearchStixCoreObjectsLines_data.graphql';
import { usePaginationLocalStorage } from '../../utils/hooks/useLocalStorage';
import useQueryLoading from '../../utils/hooks/useQueryLoading';
import useAuth from '../../utils/hooks/useAuth';
import { deserializeFilterGroupForFrontend, emptyFilterGroup, useBuildEntityTypeBasedFilterContext, useGetDefaultFilterObject } from '../../utils/filters/filtersUtils';
import { decodeSearchKeyword } from '../../utils/SearchUtils';
import DataTable from '../../components/dataGrid/DataTable';
import { UsePreloadedPaginationFragment } from '../../utils/hooks/usePreloadedPaginationFragment';
import { useFormatter } from '../../components/i18n';
import useConnectedDocumentModifier from '../../utils/hooks/useConnectedDocumentModifier';

const LOCAL_STORAGE_KEY = 'search';

const searchLineFragment = graphql`
  fragment SearchStixCoreObjectLine_node on StixCoreObject {
    id
    draftVersion {
      draft_id
      draft_operation
    }
    parent_types
    entity_type
    created_at
    ... on StixObject {
      representative {
        main
        secondary
      }
    }
    createdBy {
      ... on Identity {
        name
      }
    }
    objectMarking {
      id
      definition_type
      definition
      x_opencti_order
      x_opencti_color
    }
    objectLabel {
      id
      value
      color
    }
    creators {
      id
      name
    }
    containersNumber {
      total
    }
  }
`;

const searchStixCoreObjectsLinesQuery = graphql`
  query SearchStixCoreObjectsLinesPaginationQuery(
    $types: [String]
    $search: String
    $count: Int!
    $cursor: ID
    $orderBy: StixCoreObjectsOrdering
    $orderMode: OrderingMode
    $filters: FilterGroup
  ) {
    ...SearchStixCoreObjectsLines_data
    @arguments(
      types: $types
      search: $search
      count: $count
      cursor: $cursor
      orderBy: $orderBy
      orderMode: $orderMode
      filters: $filters
    )
  }
`;

export const searchStixCoreObjectsLinesFragment = graphql`
  fragment SearchStixCoreObjectsLines_data on Query
  @argumentDefinitions(
    types: { type: "[String]" }
    search: { type: "String" }
    count: { type: "Int", defaultValue: 25 }
    cursor: { type: "ID" }
    orderBy: { type: "StixCoreObjectsOrdering", defaultValue: name }
    orderMode: { type: "OrderingMode", defaultValue: asc }
    filters: { type: "FilterGroup" }
  )
  @refetchable(queryName: "SearchStixCoreObjectsLinesRefetchQuery") {
    globalSearch(
      types: $types
      search: $search
      first: $count
      after: $cursor
      orderBy: $orderBy
      orderMode: $orderMode
      filters: $filters
    ) @connection(key: "Pagination_globalSearch") {
      edges {
        node {
          id
          entity_type
          created_at
          createdBy {
            ... on Identity {
              name
            }
          }
          creators {
            id
            name
          }
          objectMarking {
            id
            definition_type
            definition
            x_opencti_order
            x_opencti_color
          }
          ...SearchStixCoreObjectLine_node
        }
      }
      pageInfo {
        endCursor
        hasNextPage
        globalCount
      }
    }
  }
`;

const Search = () => {
  const {
    platformModuleHelpers: { isRuntimeFieldEnable },
  } = useAuth();
  const { t_i18n } = useFormatter();
  const { setTitle } = useConnectedDocumentModifier();
  setTitle(t_i18n('Knowledge Search | Advanced Search'));
  const { keyword, filters: paramsFilters } = useParams() as { keyword: string, filters?: string };

  const searchTerm = paramsFilters ? undefined : decodeSearchKeyword(keyword);

  const initialValues = {
    sortBy: '_score',
    orderAsc: false,
    openExports: false,
    filters: {
      ...emptyFilterGroup,
      filters: useGetDefaultFilterObject(['entity_type'], ['Stix-Core-Object']),
    },
  };
  const { viewStorage, helpers: storageHelpers, paginationOptions } = usePaginationLocalStorage<SearchStixCoreObjectsLinesPaginationQuery$variables>(
    LOCAL_STORAGE_KEY,
    initialValues,
  );
  useEffect(() => {
    if (paramsFilters) {
      storageHelpers.handleSetFilters(deserializeFilterGroupForFrontend(paramsFilters) ?? emptyFilterGroup);
    }
  }, [paramsFilters]);

  const contextFilters = useBuildEntityTypeBasedFilterContext('Stix-Core-Object', viewStorage.filters);
  const queryPaginationOptions = {
    ...paginationOptions,
    filters: contextFilters,
    search: searchTerm,
  } as unknown as SearchStixCoreObjectsLinesPaginationQuery$variables;
  const queryRef = useQueryLoading<SearchStixCoreObjectsLinesPaginationQuery>(
    searchStixCoreObjectsLinesQuery,
    queryPaginationOptions,
  );

  const isRuntimeSort = isRuntimeFieldEnable() ?? false;
  const dataColumns = {
    entity_type: {
      label: 'Type',
      percentWidth: 10,
      isSortable: true,
    },
    value: {
      label: 'Value',
      percentWidth: 22,
      isSortable: false,
    },
    createdBy: {
      label: 'Author',
      percentWidth: 12,
      isSortable: isRuntimeSort,
    },
    creator: {
      label: 'Creator',
      percentWidth: 12,
      isSortable: isRuntimeSort,
    },
    objectLabel: {
      label: 'Labels',
      percentWidth: 16,
      isSortable: false,
    },
    created_at: {
      label: 'Platform creation date',
      percentWidth: 10,
      isSortable: true,
    },
    analyses: {
      label: 'Analyses',
      percentWidth: 8,
      isSortable: false,
    },
    objectMarking: {
      label: 'Marking',
      percentWidth: 10,
      isSortable: isRuntimeSort,
    },
  };

  const preloadedPaginationOptions = {
    linesQuery: searchStixCoreObjectsLinesQuery,
    linesFragment: searchStixCoreObjectsLinesFragment,
    queryRef,
    nodePath: ['globalSearch', 'pageInfo', 'globalCount'],
    setNumberOfElements: storageHelpers.handleSetNumberOfElements,
  } as UsePreloadedPaginationFragment<SearchStixCoreObjectsLinesPaginationQuery>;

  return (
    <>
      {queryRef && (
        <DataTable
          dataColumns={dataColumns}
          resolvePath={(data: SearchStixCoreObjectsLines_data$data) => data.globalSearch?.edges?.map((n) => n?.node)}
          storageKey={LOCAL_STORAGE_KEY}
          initialValues={initialValues}
          toolbarFilters={contextFilters}
          globalSearch={searchTerm}
          lineFragment={searchLineFragment}
          preloadedPaginationProps={preloadedPaginationOptions}
          exportContext={{ entity_type: 'Stix-Core-Object' }}
          availableEntityTypes={['Stix-Core-Object']}
          entityTypes={['Stix-Core-Object']}
          hideSearch={true}
        />
      )}
    </>
  );
};

export default Search;
