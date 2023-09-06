import React, { FunctionComponent } from 'react';
import SearchIndexedFilesLines, { searchIndexedFilesLinesQuery } from '@components/search/SearchIndexedFilesLines';
import {
  SearchIndexedFilesLinesPaginationQuery,
  SearchIndexedFilesLinesPaginationQuery$variables,
} from '@components/search/__generated__/SearchIndexedFilesLinesPaginationQuery.graphql';
import useQueryLoading from '../../../utils/hooks/useQueryLoading';
import Loader from '../../../components/Loader';
import useAuth from '../../../utils/hooks/useAuth';
import { usePaginationLocalStorage } from '../../../utils/hooks/useLocalStorage';
import { Filters } from '../../../components/list_lines';
import ListLines from '../../../components/list_lines/ListLines';
import ExportContextProvider from '../../../utils/ExportContextProvider';

// TODO : filters keys + redirectionMode + Datacolumns
interface SearchIndexedFilesProps {
  search: string;
}
const LOCAL_STORAGE_KEY = 'view-files';
const SearchIndexedFiles : FunctionComponent<SearchIndexedFilesProps> = ({ search }) => {
  const {
    platformModuleHelpers: { isRuntimeFieldEnable },
  } = useAuth();

  const {
    viewStorage,
    helpers: storageHelpers,
    paginationOptions,
  } = usePaginationLocalStorage<SearchIndexedFilesLinesPaginationQuery$variables>(
    LOCAL_STORAGE_KEY,
    {
      sortBy: '_score',
      orderAsc: true,
      filters: {} as Filters,
    },
  );

  const {
    numberOfElements,
    filters,
    sortBy,
    orderAsc,
    // redirectionMode,
  } = viewStorage;

  const queryRef = useQueryLoading<SearchIndexedFilesLinesPaginationQuery>(
    searchIndexedFilesLinesQuery,
    { ...paginationOptions, search },
  );

  const renderLines = () => {
    const isRuntimeSort = isRuntimeFieldEnable() ?? false;
    const dataColumns = {
      name: {
        label: 'Filename',
        width: '25%',
        isSortable: true,
      },
      uploaded_at: {
        label: 'Upload date',
        width: '10%',
        isSortable: false,
      },
      occurrences: {
        label: 'Occurrences',
        width: '10%',
        isSortable: false,
      },
      entity_type: {
        label: 'Attached entity type',
        width: '15%',
        isSortable: isRuntimeSort,
      },
      entity_name: {
        label: 'Attached entity name',
        width: '25%',
        isSortable: isRuntimeSort,
      },
      objectMarking: {
        label: 'Attached entity marking',
        width: '10%',
        isSortable: isRuntimeSort,
      },
    };

    return (
      <>
        <ListLines
          sortBy={sortBy}
          orderAsc={orderAsc}
          dataColumns={dataColumns}
          handleSort={storageHelpers.handleSort}
          handleAddFilter={storageHelpers.handleAddFilter}
          handleRemoveFilter={storageHelpers.handleRemoveFilter}
          handleChangeView={storageHelpers.handleChangeView}
          disableCards={true}
          secondaryAction={true}
          filters={filters}
          paginationOptions={paginationOptions}
          numberOfElements={numberOfElements}
          availableFilterKeys={[]}
        >
          {queryRef && (
            <React.Suspense fallback={<Loader/>}>
              <SearchIndexedFilesLines
                queryRef={queryRef}
                paginationOptions={paginationOptions}
                dataColumns={dataColumns}
                onLabelClick={storageHelpers.handleAddFilter}
                setNumberOfElements={storageHelpers.handleSetNumberOfElements}
                />
            </React.Suspense>
          )}
        </ListLines>
      </>
    );
  };
  return (
    <ExportContextProvider>
      {renderLines()}
    </ExportContextProvider>
  );
};

export default SearchIndexedFiles;
