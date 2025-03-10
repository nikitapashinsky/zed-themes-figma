import { useEffect, useRef, useState } from "react";
import * as schema from "../plugin-src/data/schema.json";
import * as Types from "../plugin-src/theme-types";
import "./App.css";

function App() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [value, setValue] = useState("");
  const [isEmpty, setIsEmpty] = useState(true);
  const [error, setError] = useState(false);
  const [jsonValue, setJsonValue] = useState<string | null>(null);
  const [themeData, setThemeData] = useState<Types.ThemeData | null>(null);
  const [defaultName, setDefaultName] = useState<string | null>(null);
  const [jsonError, setJsonError] = useState(false);

  useEffect(() => {
    // console.log(jsonValue);
    if (jsonValue) {
      try {
        setThemeData(JSON.parse(jsonValue) as Types.ThemeData);
        setJsonError(false);
      } catch (error) {
        setJsonError(true);
        console.error(error);
      }
    }
  }, [jsonValue]);

  useEffect(() => {
    if (themeData) {
      console.log(themeData.name);
      setDefaultName(themeData?.name);
    }
  }, [themeData]);

  useEffect(() => {
    if (defaultName) {
      setValue(defaultName);
    }
  }, [defaultName]);

  // if (themeData) {
  //   const themes = themeData.themes;
  //   console.log(themes);
  // }

  const onChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.value !== "") {
      setIsEmpty(false);
      setError(false);
      parent.postMessage({ pluginMessage: { type: "resize" } }, "*");
      console.log("not empty");
    }
    setValue(event.target.value);
  };

  const onCreate = () => {
    if (value === "") {
      setError(true);
      parent.postMessage({ pluginMessage: { type: "error" } }, "*");
    } else {
      parent.postMessage(
        {
          pluginMessage: {
            type: "create-collection",
            themeData: themeData,
            name: value,
          },
        },
        "*",
      );
    }
  };

  const onCancel = () => {
    parent.postMessage({ pluginMessage: { type: "cancel" } }, "*");
  };

  function handleJsonInput(event: React.ChangeEvent<HTMLTextAreaElement>) {
    setJsonValue(event.target.value);
  }

  const jsonPlaceholder = `{
  "$schema": "https://zed.dev/schema/themes/v0.2.0.json",
   "name": "One",
   "author": "Zed Industries",
   "themes": [
     {
       "name": "One Dark",
       "appearance": "dark",
       . . .etc
     },
     {
       "name": "One Light",
       "appearance": "light",
       . . .etc
     }
   ]
}`;

  return (
    <main>
      <section>
        <label htmlFor="json">Theme JSON</label>
        <textarea
          id="json"
          placeholder={jsonPlaceholder}
          value={jsonValue ?? ""}
          onChange={handleJsonInput}
          className={jsonError ? "input-error" : ""}
        ></textarea>
      </section>
      <section>
        <label htmlFor="input">Collection name</label>
        <input
          value={value}
          onChange={onChange}
          id="input"
          type="text"
          ref={inputRef}
          placeholder="E.g. Gruvbox"
          className={error ? "input-error" : ""}
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
