import React from 'react';
import { createFragmentContainer, graphql } from 'react-relay';
import { useFormatter } from '../../../../components/i18n';
import ObservedDataEditionOverview from './ObservedDataEditionOverview';
import { useIsEnforceReference } from '../../../../utils/hooks/useEntitySettings';
import Drawer, { DrawerVariant } from '../../common/drawer/Drawer';
import useHelper from '../../../../utils/hooks/useHelper';

const ObservedDataEditionContainer = (props) => {
  const { t_i18n } = useFormatter();
  const { isFeatureEnable } = useHelper();
  const isFABReplaced = isFeatureEnable('FAB_REPLACEMENT');
  const { handleClose, observedData, open, controlledDial } = props;
  const { editContext } = observedData;

  return (
    <Drawer
      title={t_i18n('Update an observed data')}
      open={open}
      onClose={handleClose}
      variant={!isFABReplaced && open == null ? DrawerVariant.update : undefined}
      context={editContext}
      controlledDial={isFABReplaced ? controlledDial : undefined}
    >
      <ObservedDataEditionOverview
        observedData={observedData}
        enableReferences={useIsEnforceReference('Observed-Data')}
        context={editContext}
        handleClose={handleClose}
      />
    </Drawer>
  );
};

const ObservedDataEditionFragment = createFragmentContainer(
  ObservedDataEditionContainer,
  {
    observedData: graphql`
      fragment ObservedDataEditionContainer_observedData on ObservedData {
        id
        ...ObservedDataEditionOverview_observedData
        editContext {
          name
          focusOn
        }
      }
    `,
  },
);

export default ObservedDataEditionFragment;
