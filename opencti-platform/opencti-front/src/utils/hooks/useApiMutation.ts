import { Disposable, GraphQLTaggedNode, IEnvironment, MutationConfig, MutationParameters, PayloadError } from 'relay-runtime';
import { useMutation, UseMutationConfig } from 'react-relay';
import { useCallback } from 'react';
import { MESSAGING$, relayErrorHandling } from '../../relay/environment';

/**
 * Hook wrapping Relay useMutation to automatically display an error popup with a message if the mutation fails
 */
const useApiMutation = <T extends MutationParameters>(
  query: GraphQLTaggedNode,
  fn?: (environment: IEnvironment, config: MutationConfig<T>) => Disposable,
  options?: {
    errorMessage?: string,
    successMessage?: string,
  },
): [(args: UseMutationConfig<T>) => void, boolean] => {
  const [commit, inFlight] = useMutation(query, fn);
  const commitWithError = useCallback((args: UseMutationConfig<T>) => {
    commit({
      ...args,
      onError: (error: Error) => {
        if (args.onError) {
          args.onError(error);
          MESSAGING$.notifyError(options?.errorMessage
            ? options.errorMessage
            : `${error}`);
        } else relayErrorHandling(error);
      },
      onCompleted: (response: T['response'], errors: PayloadError[] | null) => {
        if (args.onCompleted) args.onCompleted(response, errors);
        if (options?.successMessage) MESSAGING$.notifySuccess(options.successMessage);
      },
    });
  }, [commit]);
  return [commitWithError, inFlight];
};

export default useApiMutation;
