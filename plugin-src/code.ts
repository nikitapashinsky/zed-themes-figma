console.log("TEST");
import * as themeJson from "./data/ayu.json";
import * as schema from "./data/schema.json";
import * as Types from "./theme-types";
import { parseHex } from "./utils/parseHex";

const schemaData = JSON.parse(JSON.stringify(schema));
// TODO: use schemaProperties to get property descriptions
const schemaProperties = schemaData.definitions.ThemeStyleContent.properties;

const themeData = JSON.parse(JSON.stringify(themeJson)) as Types.ThemeData;
const themes = themeData.themes;

const lightTheme = themes.find((theme) => theme.appearance === "light");
const darkTheme = themes.find((theme) => theme.appearance === "dark");

const lightThemeStyle = lightTheme ? lightTheme.style : undefined;
const darkThemeStyle = darkTheme ? darkTheme.style : undefined;

const lightThemeStyleSyntax = lightTheme ? lightTheme.style.syntax : undefined;
const darkThemeStyleSyntax = darkTheme ? darkTheme.style.syntax : undefined;

const lightThemeStylePlayers = lightTheme
  ? lightTheme.style.players
  : undefined;
const darkThemeStylePlayers = darkTheme ? darkTheme.style.players : undefined;

figma.showUI(__html__, { themeColors: true, height: 100 });

figma.ui.onmessage = async (msg: { type: string; name: string }) => {
  if (msg.type === "error") {
    figma.ui.resize(300, 124);
  }
  if (msg.type === "resize") {
    figma.ui.resize(300, 100);
  }
  if (msg.type === "create-collection") {
    const collectionName = msg.name;
    const notification = figma.notify("Creating variable collection…");
    await new Promise((resolve) => setTimeout(resolve, 100));

    // Create a variable collection with light and dark modes
    const collection = figma.variables.createVariableCollection(
      collectionName,
    ) as VariableCollection;

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
          variable.setValueForMode(lightModeId, {
            r: 0,
            g: 0,
            b: 0,
            a: 0,
          });
        }
      });
    }

    if (lightThemeStyleSyntax) {
      Object.entries(lightThemeStyleSyntax).forEach(([key, value]) => {
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

    if (lightThemeStylePlayers) {
      Object.entries(lightThemeStylePlayers).forEach(([key, value]) => {
        // console.log(key);
        Object.entries(value).forEach(([property, value]) => {
          console.log(key, property, value);
          const playerNumber = (parseInt(key) + 1).toString();
          const variable = figma.variables.createVariable(
            `players/${playerNumber}/${property}`,
            collection,
            "COLOR",
          );
          variable.setValueForMode(lightModeId, parseHex(value));
        });
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
          variable.setValueForMode(darkModeId, {
            r: 0,
            g: 0,
            b: 0,
            a: 0,
          });
        }
      });
    }

    if (darkThemeStyleSyntax) {
      const localColorVariables =
        await figma.variables.getLocalVariablesAsync("COLOR");

      const currentCollectionVariables = localColorVariables.filter(
        (variable) => variable.variableCollectionId === collection.id,
      );

      Object.entries(darkThemeStyleSyntax).forEach(([key, value]) => {
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

    if (darkThemeStylePlayers) {
      const localColorVariables =
        await figma.variables.getLocalVariablesAsync("COLOR");

      const currentCollectionVariables = localColorVariables.filter(
        (variable) => variable.variableCollectionId === collection.id,
      );
      currentCollectionVariables.filter((variable) => {
        console.log(variable.name);
      });
      Object.entries(darkThemeStylePlayers).forEach(([key, value]) => {
        const playerNumber = (parseInt(key) + 1).toString();
        Object.entries(value).forEach(([property, value]) => {
          key = `players/${playerNumber}/${property}`;
          console.log("dark key property value: " + key, property, value);
          currentCollectionVariables.filter((variable) => {
            if (variable.name === key) {
              variable.setValueForMode(darkModeId, parseHex(value));
            }
          })!;
        });
      });
    }
    notification.cancel();
    figma.closePlugin();
  }
  if (msg.type === "cancel") {
    figma.closePlugin();
  }
};
// const localCollections =
//   await figma.variables.getLocalVariableCollectionsAsync();

// let collection = localCollections.find(
//   (collection) => collection.name === themeData.name,
// );

// if (!collection) {
// }
