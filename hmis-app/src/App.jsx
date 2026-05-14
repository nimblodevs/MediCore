import { Toaster } from "sonner";
import HMS from "./HMS.jsx";

const App = () => {
  return (
    <>
      <HMS />
      <Toaster richColors position="top-center" closeButton />
    </>
  );
};

export default App;
