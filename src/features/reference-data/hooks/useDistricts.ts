import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createDistrict,
  deleteDistrict,
  fetchDistricts,
  updateDistrict,
} from "@/features/reference-data/api/referenceDataApi";
import { employeeKeys, referenceKeys } from "@/shared/api/queryKeys";
import type { DistrictDto, DistrictPayload } from "@/shared/types/api";

export function useDistricts(regionId: number | null) {
  return useQuery({
    queryKey: referenceKeys.districts(regionId),
    queryFn: () => fetchDistricts(regionId as number),
    enabled: regionId !== null,
    staleTime: 5 * 60 * 1000,
  });
}

export function useDistrictMutations(regionId: number | null) {
  const queryClient = useQueryClient();

  const invalidate = () => {
    void queryClient.invalidateQueries({ queryKey: referenceKeys.districts(regionId) });
    void queryClient.invalidateQueries({ queryKey: employeeKeys.all });
  };

  const create = useMutation({
    mutationFn: (payload: DistrictPayload) => createDistrict(payload),
    onSuccess: invalidate,
  });

  const update = useMutation({
    mutationFn: (district: DistrictDto) => updateDistrict(district),
    onSuccess: invalidate,
  });

  const remove = useMutation({
    mutationFn: (id: number) => deleteDistrict(id),
    onSuccess: invalidate,
  });

  return { create, update, remove };
}
