import { Spin } from "antd";

export function LoadingScreen() {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        height: "100vh",
        background: "#F5F7F6",
      }}
    >
      <Spin size="large" />
    </div>
  );
}
