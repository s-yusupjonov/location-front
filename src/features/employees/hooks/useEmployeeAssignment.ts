import { useMutation, useQueryClient } from "@tanstack/react-query";
import { assignEmployee } from "@/features/employees/api/employeesApi";
import { employeeKeys } from "@/shared/api/queryKeys";
import type { EmployeeAssignmentPayload } from "@/shared/types/api";

interface AssignmentVariables {
  employeeId: number;
  payload: EmployeeAssignmentPayload;
}

export function useEmployeeAssignment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ employeeId, payload }: AssignmentVariables) =>
      assignEmployee(employeeId, payload),
    onSuccess: (_data, variables) => {
      void queryClient.invalidateQueries({ queryKey: employeeKeys.all });
      void queryClient.invalidateQueries({
        queryKey: employeeKeys.detail(variables.employeeId),
      });
    },
  });
}
