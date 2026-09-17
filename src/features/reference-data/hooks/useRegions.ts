import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createRegion,
  deleteRegion,
  fetchRegions,
  updateRegion,
} from "@/features/reference-data/api/referenceDataApi";
import { employeeKeys, referenceKeys } from "@/shared/api/queryKeys";
import type { RegionDto, RegionPayload } from "@/shared/types/api";

export function useRegions() {
  return useQuery({
    queryKey: referenceKeys.regions,
    queryFn: fetchRegions,
    staleTime: 5 * 60 * 1000,
  });
}

export function useRegionMutations() {
  const queryClient = useQueryClient();

  const invalidate = () => {
    void queryClient.invalidateQueries({ queryKey: referenceKeys.regions });
    void queryClient.invalidateQueries({ queryKey: employeeKeys.all });
  };

  const create = useMutation({
    mutationFn: (payload: RegionPayload) => createRegion(payload),
    onSuccess: invalidate,
  });

  const update = useMutation({
    mutationFn: (region: RegionDto) => updateRegion(region),
    onSuccess: invalidate,
  });

  const remove = useMutation({
    mutationFn: (id: number) => deleteRegion(id),
    onSuccess: invalidate,
  });

  return { create, update, remove };
}
