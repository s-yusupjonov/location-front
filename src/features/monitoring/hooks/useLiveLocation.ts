import { useEffect, useRef, useState } from "react";
import { Client, type StompSubscription } from "@stomp/stompjs";
import { getToken } from "@/features/auth/api/tokenStorage";
import type { LiveLocationMessage } from "@/shared/types/api";

const wsUrl = import.meta.env.VITE_WS_URL as string;

export function useLiveLocation(employeeId: number | null, isEnabled: boolean) {
  const [liveMarker, setLiveMarker] = useState<[number, number] | null>(null);
  const clientRef = useRef<Client | null>(null);
  const subscriptionRef = useRef<StompSubscription | null>(null);

  useEffect(() => {
    setLiveMarker(null);

    if (!isEnabled || employeeId === null) {
      return;
    }

    const client = new Client({
      brokerURL: wsUrl,
      connectHeaders: {
        Authorization: `Bearer ${getToken() ?? ""}`,
      },
      reconnectDelay: 4000,
      onConnect: () => {
        subscriptionRef.current = client.subscribe(
          `/topic/locations/${employeeId}`,
          (message) => {
            try {
              const payload = JSON.parse(message.body) as LiveLocationMessage;
              setLiveMarker([payload.latitude, payload.longitude]);
            } catch {
              setLiveMarker((previous) => previous);
            }
          },
        );
      },
    });

    client.activate();
    clientRef.current = client;

    return () => {
      subscriptionRef.current?.unsubscribe();
      subscriptionRef.current = null;
      void client.deactivate();
      clientRef.current = null;
    };
  }, [employeeId, isEnabled]);

  return liveMarker;
}
