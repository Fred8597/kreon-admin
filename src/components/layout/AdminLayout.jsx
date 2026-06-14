import Sidebar from "./Sidebar";
import Topbar from "./Topbar";

export default function AdminLayout({ children }) {
  return (
    <div style={styles.layout}>
      <Sidebar />
      <main style={styles.main}>
        <Topbar />
        <div style={styles.content}>{children}</div>
      </main>
    </div>
  );
}

const styles = {
  layout: {
    minHeight: "100vh",
    background: "#0a0f0d",
  },
  main: {
    marginLeft: "260px",
    minHeight: "100vh",
  },
  content: {
    padding: "32px",
  },
};