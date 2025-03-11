import { useEffect, useRef, useState } from "react";
import * as Types from "../plugin-src/theme-types";
import "./App.css";

function isValidJSON(string: string): boolean {
  if (!string) return false;
  try {
    JSON.parse(string);
    return true;
  } catch (error) {
    return false;
  }
}

function isValidTheme(data: any): boolean {
  return (
    data &&
    typeof data === "object" &&
    "$schema" in data &&
    "name" in data &&
    "themes" in data &&
    Array.isArray(data.themes) &&
    data.themes.length > 0
  );
}

function App() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [collectionName, setCollectionName] = useState("");
  const [showNameError, setShowNameError] = useState(false);
  const [themeData, setThemeData] = useState<Types.ThemeData | null>(null);
  const [defaultName, setDefaultName] = useState<string | null>(null);
  const [jsonValue, setJsonValue] = useState<string | null>("");
  const [jsonError, setJsonError] = useState<
    false | "INVALID_JSON" | "INVALID_THEME"
  >(false);

  function onJsonInput(event: React.ChangeEvent<HTMLTextAreaElement>) {
    const userInput = event.target.value;
    setJsonValue(userInput);
    // setJsonError(!isValidJSON(userInput) ? "INVALID_JSON" : false);
  }

  useEffect(() => {
    if (!jsonValue || jsonValue.trim() === "") {
      setJsonError(false);
      setThemeData(null);
      return;
    }

    if (!isValidJSON(jsonValue)) {
      setJsonError("INVALID_JSON");
      setThemeData(null);
      return;
    }

    try {
      const parsedJson = JSON.parse(jsonValue);

      if (!isValidTheme(parsedJson)) {
        setJsonError("INVALID_THEME");
        setThemeData(null);
        return;
      }

      setJsonError(false);
      const parsedThemeData = parsedJson as Types.ThemeData;
      setThemeData(parsedThemeData);

      console.log(
        "Found multiple light and dark themes. Select up to four variants: ",
      );

      parsedThemeData.themes.forEach((theme) => {
        console.log(`Name: ${theme.name}, appearance: ${theme.appearance}`);
      });

      setDefaultName(parsedThemeData.name);
      setCollectionName(parsedThemeData.name);
      setShowNameError(false);
    } catch (error) {
      console.error("Error parsing JSON:", error);
      setJsonError("INVALID_JSON");
      setThemeData(null);
    }
  }, [jsonValue]);

  const onNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const userInput = event.target.value;
    setCollectionName(userInput);

    if (userInput !== "") {
      setShowNameError(false);
      parent.postMessage({ pluginMessage: { type: "resize" } }, "*");
    }
    setCollectionName(event.target.value);
  };

  const onCreate = () => {
    if (collectionName === "") {
      setShowNameError(true);
      return;
    }
    if (!isValidJSON(jsonValue!)) {
      setJsonError("INVALID_JSON");
      return;
    }

    const parsedJson = JSON.parse(jsonValue!);
    if (!isValidTheme(parsedJson)) {
      setJsonError("INVALID_THEME");
      return;
    }

    if (!jsonValue || !isValidJSON(jsonValue)) {
      setJsonError("INVALID_JSON");
      return;
    }

    parent.postMessage(
      {
        pluginMessage: {
          type: "create-collection",
          themeData: themeData,
          name: collectionName,
        },
      },
      "*",
    );
  };

  const onCancel = () => {
    parent.postMessage({ pluginMessage: { type: "cancel" } }, "*");
  };

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
          value={jsonValue}
          onChange={onJsonInput}
          className={jsonError ? "input-error" : ""}
        ></textarea>
        {jsonError === "INVALID_JSON" && (
          <span className="error">This is not valid JSON</span>
        )}
        {jsonError === "INVALID_THEME" && (
          <span className="error">This is not a valid theme format</span>
        )}
      </section>
      <section>
        <label htmlFor="input">Collection name</label>
        <input
          value={collectionName}
          onChange={onNameChange}
          id="input"
          type="text"
          ref={inputRef}
          placeholder="E.g. Gruvbox"
          className={showNameError ? "input-error" : ""}
        />
        {showNameError && (
          <span className="error">Please enter a name for your collection</span>
        )}
      </section>
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
