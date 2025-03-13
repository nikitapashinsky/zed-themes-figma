export default function Import() {
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
  </section>;
  {
    isValidThemeData && themes.length > 2 && (
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
    );
  }
  {
    isValidThemeData && (
      <section>
        <label htmlFor="input">Collection name</label>
        <input
          value={collectionName}
          onChange={onNameChange}
          id="input"
          type="text"
          placeholder={defaultName || "E.g. Gruvbox"}
          className={showNameError ? "input-error" : ""}
        />
        {showNameError && (
          <span className="error">Please enter a name for your collection</span>
        )}
      </section>
    );
  }
}
