import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deactivateEmployee } from "@/features/employees/api/employeesApi";
import { employeeKeys } from "@/shared/api/queryKeys";

export function useEmployeeDeactivation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (employeeId: number) => deactivateEmployee(employeeId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: employeeKeys.all });
    },
  });
}
