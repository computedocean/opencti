import React, { FunctionComponent } from 'react';
import useQueryLoading from '../../../../utils/hooks/useQueryLoading';
import Loader, { LoaderVariant } from '../../../../components/Loader';
import {
  StixCoreObjectQuickSubscriptionContentPaginationQuery,
} from './__generated__/StixCoreObjectQuickSubscriptionContentPaginationQuery.graphql';
import StixCoreObjectQuickSubscriptionContent, {
  stixCoreObjectQuickSubscriptionContentQuery,
} from './StixCoreObjectQuickSubscriptionContent';

interface StixCoreObjectQuickSubscriptionProps {
  instanceId: string,
  instanceName: string,
}

const StixCoreObjectQuickSubscription: FunctionComponent<StixCoreObjectQuickSubscriptionProps> = ({ instanceId, instanceName }) => {
  const paginationOptions = {
    filters: {
      mode: 'and',
      filterGroups: [],
      filters: [
        {
          key: ['filters'],
          values: [instanceId],
          operator: 'match',
          mode: 'or',
        },
        {
          key: ['instance_trigger'],
          values: [true.toString()],
          operator: 'match',
          mode: 'or',
        },
      ],
    },
  };
  const queryRef = useQueryLoading<StixCoreObjectQuickSubscriptionContentPaginationQuery>(
    stixCoreObjectQuickSubscriptionContentQuery,
    paginationOptions,
  );

  return (
    <div>
      {queryRef
        && <React.Suspense fallback={<Loader variant={LoaderVariant.inElement}/>}>
          <StixCoreObjectQuickSubscriptionContent
            queryRef={queryRef}
            paginationOptions={paginationOptions}
            instanceId={instanceId}
            instanceName={instanceName}
          />
        </React.Suspense>
      }
    </div>
  );
};

export default StixCoreObjectQuickSubscription;
