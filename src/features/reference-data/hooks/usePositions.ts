import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createPosition,
  deletePosition,
  fetchPositions,
  updatePosition,
} from "@/features/reference-data/api/referenceDataApi";
import { employeeKeys, referenceKeys } from "@/shared/api/queryKeys";
import type { PositionDto, PositionPayload } from "@/shared/types/api";

export function usePositions() {
  return useQuery({
    queryKey: referenceKeys.positions,
    queryFn: fetchPositions,
    staleTime: 5 * 60 * 1000,
  });
}

export function usePositionMutations() {
  const queryClient = useQueryClient();

  const invalidate = () => {
    void queryClient.invalidateQueries({ queryKey: referenceKeys.positions });
    void queryClient.invalidateQueries({ queryKey: employeeKeys.all });
  };

  const create = useMutation({
    mutationFn: (payload: PositionPayload) => createPosition(payload),
    onSuccess: invalidate,
  });

  const update = useMutation({
    mutationFn: (position: PositionDto) => updatePosition(position),
    onSuccess: invalidate,
  });

  const remove = useMutation({
    mutationFn: (id: number) => deletePosition(id),
    onSuccess: invalidate,
  });

  return { create, update, remove };
}
