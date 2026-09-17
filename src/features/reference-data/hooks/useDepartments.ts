import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createDepartment,
  deleteDepartment,
  fetchDepartments,
  updateDepartment,
} from "@/features/reference-data/api/referenceDataApi";
import { employeeKeys, referenceKeys } from "@/shared/api/queryKeys";
import type { DepartmentDto, DepartmentPayload } from "@/shared/types/api";

export function useDepartments() {
  return useQuery({
    queryKey: referenceKeys.departments,
    queryFn: fetchDepartments,
    staleTime: 5 * 60 * 1000,
  });
}

export function useDepartmentMutations() {
  const queryClient = useQueryClient();

  const invalidate = () => {
    void queryClient.invalidateQueries({ queryKey: referenceKeys.departments });
    void queryClient.invalidateQueries({ queryKey: employeeKeys.all });
  };

  const create = useMutation({
    mutationFn: (payload: DepartmentPayload) => createDepartment(payload),
    onSuccess: invalidate,
  });

  const update = useMutation({
    mutationFn: (department: DepartmentDto) => updateDepartment(department),
    onSuccess: invalidate,
  });

  const remove = useMutation({
    mutationFn: (id: number) => deleteDepartment(id),
    onSuccess: invalidate,
  });

  return { create, update, remove };
}
