import { useRef, useState } from "react";
import "./App.css";

function App() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [value, setValue] = useState("");
  const [isEmpty, setIsEmpty] = useState(true);
  const [error, setError] = useState(false);

  const onChange = (event) => {
    if (event.target.value !== "") {
      setIsEmpty(false);
    }
    setValue(event.target.value);
  };

  const onCreate = () => {
    if (value === "") {
      setError(true);
      parent.postMessage({ pluginMessage: { type: "error" } }, "*");
    } else {
      parent.postMessage(
        { pluginMessage: { type: "create-collection", name: value } },
        "*",
      );
    }
  };

  const onCancel = () => {
    parent.postMessage({ pluginMessage: { type: "cancel" } }, "*");
  };

  return (
    <main>
      <section>
        <label htmlFor="input">Collection name</label>
        <input
          value={value}
          onChange={onChange}
          id="input"
          type="text"
          ref={inputRef}
          placeholder="E.g. Gruvbox"
        />
      </section>
      {error && (
        <span className="error">Please enter a name for your collection</span>
      )}
      <footer>
        <button data-type="cancel" onClick={onCancel}>
          Cancel
        </button>
        <button data-type="create" className="brand" onClick={onCreate}>
          Create
        </button>
      </footer>
    </main>
  );
}

export default App;
