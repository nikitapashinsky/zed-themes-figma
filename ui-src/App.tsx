import JSON5 from "json5";
import { useEffect, useRef, useState } from "react";
import * as Types from "../plugin-src/theme-types";
import "./styles/App.css";
import { Checkbox } from "radix-ui";
import { CheckIcon } from "@radix-ui/react-icons";

function isValidJSON(string: string): boolean {
  if (!string) return false;
  try {
    JSON5.parse(string);
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
  const textAreaRef = useRef<HTMLTextAreaElement>(null);
  const fieldsetRef = useRef<HTMLFieldSetElement>(null);
  const [defaultName, setDefaultName] = useState<string>("");
  const [collectionName, setCollectionName] = useState("");
  const [themeData, setThemeData] = useState<Types.ThemeData | null>(null);
  const [isValidThemeData, setIsValidThemeData] = useState(false);
  const [sortedThemes, setSortedThemes] = useState<Types.ThemeMetadata[]>([]);
  const [themes, setThemes] = useState<Types.ThemeMetadata[]>([]);
  const [isExpandedView, setIsExpandedView] = useState(false);
  const initialSelectedThemes = themes
    ? Object.fromEntries(themes.map((theme) => [theme.name, false]))
    : {};
  const [selectedThemes, setSelectedThemes] = useState(initialSelectedThemes);
  const [jsonValue, setJsonValue] = useState<string>("");
  const [jsonError, setJsonError] = useState<
    false | "INVALID_JSON" | "INVALID_THEME"
  >(false);
  const [showNameError, setShowNameError] = useState(false);
  const [showSelectedThemesError, setSelectedThemesError] = useState(false);

  function onJsonInput(event: React.ChangeEvent<HTMLTextAreaElement>) {
    const userInput = event.target.value;
    setJsonValue(userInput);
  }

  useEffect(() => {
    if (textAreaRef.current) {
      textAreaRef.current.focus();
    }
  }, []);

  useEffect(() => {
    if (!jsonValue || jsonValue.trim() === "") {
      setJsonError(false);
      setThemeData(null);
      setIsValidThemeData(false);
      setSelectedThemes(initialSelectedThemes);

      if (isExpandedView) {
        setIsExpandedView(false);
        parent.postMessage({ pluginMessage: { type: "reset-size" } }, "*");
      }
      return;
    }

    if (!isValidJSON(jsonValue)) {
      setJsonError("INVALID_JSON");
      setThemeData(null);
      setIsValidThemeData(false);
      return;
    }

    try {
      const parsedJson = JSON5.parse(jsonValue);

      if (!isValidTheme(parsedJson)) {
        setJsonError("INVALID_THEME");
        setThemeData(null);
        setIsValidThemeData(false);
        return;
      }
      console.log("Initial selected themes: ", initialSelectedThemes);
      const parsedThemeData = parsedJson as Types.ThemeData;
      const parsedThemes = parsedThemeData.themes.map(
        (theme: Types.ThemeMetadata) => ({
          name: theme.name,
          appearance: theme.appearance,
        }),
      );

      const parsedDarkThemes = parsedThemes.filter(
        ({ appearance }) => appearance === "dark",
      );

      const parsedLightThemes = parsedThemes.filter(
        ({ appearance }) => appearance === "light",
      );

      const sortedParsedThemes: Types.ThemeMetadata[] = [];

      for (
        let i = 0;
        i < Math.max(parsedDarkThemes.length, parsedLightThemes.length);
        i++
      ) {
        if (i < parsedDarkThemes.length)
          sortedParsedThemes.push(parsedDarkThemes[i]);
        if (i < parsedLightThemes.length)
          sortedParsedThemes.push(parsedLightThemes[i]);
      }

      setSortedThemes(sortedParsedThemes);

      const shouldShowCheckboxes = parsedThemes.length > 2;
      setIsExpandedView(shouldShowCheckboxes);

      if (shouldShowCheckboxes && !isExpandedView) {
        parent.postMessage({ pluginMessage: { type: "resize" } }, "*");
      } else if (!shouldShowCheckboxes && isExpandedView) {
        parent.postMessage({ pluginMessage: { type: "reset-size" } }, "*");
      }

      setSelectedThemes(initialSelectedThemes);
      setSelectedThemesError(false);
      setThemes(parsedThemes);
      setThemeData(parsedThemeData);
      setIsValidThemeData(true);
      setJsonError(false);

      setDefaultName(parsedThemeData.name);
      setCollectionName(parsedThemeData.name);
      setShowNameError(false);
    } catch (error) {
      console.error("Error parsing JSON:", error);
      setJsonError("INVALID_JSON");
      setThemeData(null);
      setIsValidThemeData(false);
    }
  }, [jsonValue]);

  useEffect(() => {
    if (themes.length <= 2 && isExpandedView) {
      setIsExpandedView(false);
      parent.postMessage({ pluginMessage: { type: "reset-size" } }, "*");
    }
  }, [themes, isExpandedView]);

  const onNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const userInput = event.target.value;
    setCollectionName(userInput);
  };

  const onCreate = () => {
    if (!isValidThemeData) {
      setJsonError("INVALID_THEME");
      return;
    }

    const updatedSelectedThemes = Object.values(selectedThemes);
    if (updatedSelectedThemes.every((value) => value === false)) {
      setSelectedThemesError(true);
      return;
    }

    const finalName = collectionName.trim() || defaultName;

    if (!finalName) {
      setShowNameError(true);
      return;
    }

    parent.postMessage(
      {
        pluginMessage: {
          type: "create-collection",
          themeData: themeData,
          name: finalName,
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
          ref={textAreaRef}
          value={jsonValue ?? ""}
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
      {isValidThemeData && themes.length > 2 && (
        <form className="select-themes-container">
          <p className="description">
            Multiple themes found. Select up to 4 themes to include in the
            collection.
          </p>
          <fieldset ref={fieldsetRef} className="select-themes">
            {sortedThemes.map(({ name, appearance }) => {
              return (
                <div key={name} className="CheckboxContainer">
                  <Checkbox.Root
                    className="CheckboxRoot"
                    id={name}
                    value={name}
                    checked={!!selectedThemes[name]}
                    disabled={
                      !selectedThemes[name] &&
                      Object.values(selectedThemes).filter(Boolean).length >= 4
                    }
                    onCheckedChange={(checked) => {
                      if (typeof checked === "boolean") {
                        if (checked === false) {
                          setSelectedThemes({
                            ...selectedThemes,
                            [name]: checked,
                          });
                        } else if (checked === true) {
                          setSelectedThemesError(false);
                          setSelectedThemes({
                            ...selectedThemes,
                            [name]: checked,
                          });
                        }
                      }
                    }}
                  >
                    <Checkbox.Indicator className="CheckboxIndicator">
                      <CheckIcon />
                    </Checkbox.Indicator>
                  </Checkbox.Root>
                  <label className="CheckboxLabel" htmlFor={name}>
                    <span>{name}</span>
                    <span>
                      {appearance.charAt(0).toUpperCase() + appearance.slice(1)}
                    </span>
                  </label>
                </div>
              );
            })}
          </fieldset>
          {showSelectedThemesError && (
            <p className="error">Please select at least 1 theme.</p>
          )}
        </form>
      )}
      {isValidThemeData && (
        <section>
          <label htmlFor="input">Collection name</label>
          <input
            value={collectionName}
            onChange={onNameChange}
            id="input"
            type="text"
            // ref={inputRef}
            placeholder={defaultName || "E.g. Gruvbox"}
            className={showNameError ? "input-error" : ""}
          />
          {showNameError && (
            <span className="error">
              Please enter a name for your collection
            </span>
          )}
        </section>
      )}
      <footer>
        <button className="button button-secondary">Show help</button>
        <button className="button button-primary brand" onClick={onCreate}>
          Create collection
        </button>
      </footer>
    </main>
  );
}

export default App;
