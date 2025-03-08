import * as themeJson from "./data/ayu.json";
import * as schema from "./data/schema.json";
import * as Types from "./theme-types";
import { parseHex } from "./utils/parseHex";

const themeData = JSON.parse(JSON.stringify(themeJson)) as Types.ThemeData;
const themes = themeData.themes;

const schemaData = JSON.parse(JSON.stringify(schema));
const schemaProperties = schemaData.definitions.ThemeStyleContent.properties;

// console.log(schemaProperties);

const lightTheme = themes.find((theme) => theme.appearance === "light");
const darkTheme = themes.find((theme) => theme.appearance === "dark");

const lightThemeStyle = lightTheme ? lightTheme.style : undefined;
const darkThemeStyle = darkTheme ? darkTheme.style : undefined;

const lightThemeSyntaxStyle = lightTheme ? lightTheme.style.syntax : undefined;
const darkThemeSyntaxStyle = darkTheme ? darkTheme.style.syntax : undefined;

const lightThemePlayers = lightTheme ? lightTheme.style.players : undefined;
const darkThemePlayers = darkTheme ? darkTheme.style.players : undefined;

async function main() {
  try {
    const localCollections =
      await figma.variables.getLocalVariableCollectionsAsync();
    const modes = localCollections.map((collection) => collection.modes);
    // console.log(modes);

    const collectionNames = localCollections.map(
      (collection) => collection.name,
    );
    if (!collectionNames.includes(themeData.name)) {
      const notification = figma.notify("Generating color variables…");
      await new Promise((resolve) => setTimeout(resolve, 100));

      // Create a variable collection with light and dark modes
      const collection = figma.variables.createVariableCollection(
        themeData.name,
      );

      collection.renameMode(collection.modes[0].modeId, "Light");
      const lightModeId = collection.modes[0].modeId;
      const darkModeId = collection.addMode("Dark");

      if (lightThemeStyle) {
        Object.entries(lightThemeStyle).forEach(([key, value]) => {
          let transformedKey = key;
          if (typeof value === "string") {
            if (key.includes(".")) {
              transformedKey = key.replace(/\./g, "/");
            } else {
              transformedKey = `${key}/${key}`;
            }
            const variable = figma.variables.createVariable(
              transformedKey,
              collection,
              "COLOR",
            );
            variable.setValueForMode(lightModeId, parseHex(value));
            variable.setVariableCodeSyntax("WEB", `"${key}"`);
          }

          if (value === null) {
            if (key.includes(".")) {
              key = key.replace(/\./g, "/");
            } else {
              key = `${key}/${key}`;
            }
            const variable = figma.variables.createVariable(
              key,
              collection,
              "COLOR",
            );
            variable.setValueForMode(lightModeId, { r: 0, g: 0, b: 0, a: 0 });
          }
        });
      }

      if (lightThemeSyntaxStyle) {
        Object.entries(lightThemeSyntaxStyle).forEach(([key, value]) => {
          if (typeof value.color === "string") {
            if (key.includes(".")) {
              key = key.replace(/\./g, "/");
            } else {
              key = `${key}/${key}`;
            }
            const variable = figma.variables.createVariable(
              `syntax/${key}`,
              collection,
              "COLOR",
            );
            variable.setValueForMode(lightModeId, parseHex(value.color));
          }
        });
      }

      if (lightThemePlayers) {
        const localColorVariables =
          await figma.variables.getLocalVariablesAsync("COLOR");

        const currentCollectionVariables = localColorVariables.filter(
          (variable) => variable.variableCollectionId === collection.id,
        );

        Object.entries(lightThemePlayers).forEach(([key, value]) => {
          console.log(key, value);
        });
      }

      if (darkThemeSyntaxStyle) {
        const localColorVariables =
          await figma.variables.getLocalVariablesAsync("COLOR");

        const currentCollectionVariables = localColorVariables.filter(
          (variable) => variable.variableCollectionId === collection.id,
        );

        Object.entries(darkThemeSyntaxStyle).forEach(([key, value]) => {
          if (typeof value.color === "string") {
            if (key.includes(".")) {
              key = key.replace(/\./g, "/");
              key = `syntax/${key}`;
            } else {
              key = `${key}/${key}`;
              key = `syntax/${key}`;
            }
            currentCollectionVariables.filter((variable) => {
              if (key === variable.name) {
                variable.setValueForMode(darkModeId, parseHex(value.color));
              }
            });
          }
        });
      }

      if (darkThemeStyle) {
        const localColorVariables =
          await figma.variables.getLocalVariablesAsync("COLOR");

        const currentCollectionVariables = localColorVariables.filter(
          (variable) => variable.variableCollectionId === collection.id,
        );
        Object.entries(darkThemeStyle).forEach(([_, value], index) => {
          const variable = currentCollectionVariables[index];
          if (variable && typeof value === "string") {
            variable.setValueForMode(darkModeId, parseHex(value));
          }
          if (variable && value === null) {
            variable.setValueForMode(darkModeId, { r: 0, g: 0, b: 0, a: 0 });
          }
        });
      }
      notification.cancel();
    }
    figma.closePlugin();
  } catch (error) {
    console.error(error);
  }
}

main();
