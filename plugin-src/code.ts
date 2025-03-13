import * as Types from "./theme-types";
import { parseHex } from "./utils/parseHex";

figma.showUI(__html__, { themeColors: true, height: 400 });

figma.ui.onmessage = async (msg: {
  type: string;
  themeData?: Types.ThemeData;
  name?: string;
}) => {
  if (msg.type === "resize") {
    console.log("received resize message");
    figma.ui.resize(300, 560);
    return;
  }

  if (msg.type === "reset-size") {
    figma.ui.resize(300, 400);
    return;
  }

  try {
    if (msg.type === "create-collection") {
      if (!msg.themeData || !msg.name) {
        throw new Error("Missing required data");
      }
      try {
        const notification = figma.notify("Creating variable collection…");
        await new Promise((resolve) => setTimeout(resolve, 100));

        const collectionName = msg.name;

        // Create a variable collection with light and dark modes
        const collection = figma.variables.createVariableCollection(
          collectionName,
        ) as VariableCollection;
        let lightModeId: string;
        let darkModeId: string;

        const themes = msg.themeData.themes;
        if (!themes) {
          throw new Error("No themes found in theme data");
        }

        const lightTheme = themes.find((theme) => theme.appearance === "light");
        const darkTheme = themes.find((theme) => theme.appearance === "dark");

        if (lightTheme && darkTheme) {
          collection.renameMode(collection.modes[0].modeId, "Light");
          lightModeId = collection.modes[0].modeId;
          darkModeId = collection.addMode("Dark");
        } else if (!lightTheme && darkTheme) {
          collection.renameMode(collection.modes[0].modeId, "Dark");
          darkModeId = collection.modes[0].modeId;
        } else if (lightTheme && !darkTheme) {
          collection.renameMode(collection.modes[0].modeId, "Light");
          lightModeId = collection.modes[0].modeId;
        }

        const lightThemeStyle = lightTheme ? lightTheme.style : undefined;
        const darkThemeStyle = darkTheme ? darkTheme.style : undefined;

        const lightThemeStyleSyntax = lightTheme
          ? lightTheme.style.syntax
          : undefined;
        const darkThemeStyleSyntax = darkTheme
          ? darkTheme.style.syntax
          : undefined;

        const lightThemeStylePlayers = lightTheme
          ? lightTheme.style.players
          : undefined;
        const darkThemeStylePlayers = darkTheme
          ? darkTheme.style.players
          : undefined;

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
            Object.entries(value).forEach(([property, value]) => {
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
          if (lightThemeStyle) {
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
          } else {
            Object.entries(darkThemeStyle).forEach(([key, value]) => {
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
                variable.setValueForMode(darkModeId, parseHex(value));
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
                variable.setValueForMode(darkModeId, {
                  r: 0,
                  g: 0,
                  b: 0,
                  a: 0,
                });
              }
            });
          }
        }

        if (darkThemeStyleSyntax) {
          if (lightThemeStyleSyntax) {
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
                const variable = currentCollectionVariables.find(
                  (v) => v && v.name === key,
                );
                if (variable) {
                  variable.setValueForMode(darkModeId, parseHex(value.color));
                }
              }
            });
          } else if (!lightThemeStyleSyntax) {
            Object.entries(darkThemeStyleSyntax).forEach(([key, value]) => {
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
                variable.setValueForMode(darkModeId, parseHex(value.color));
              }
            });
          }
        }

        if (darkThemeStylePlayers) {
          if (lightThemeStylePlayers) {
            const localColorVariables =
              await figma.variables.getLocalVariablesAsync("COLOR");

            const currentCollectionVariables = localColorVariables.filter(
              (variable) => variable.variableCollectionId === collection.id,
            );

            Object.entries(darkThemeStylePlayers).forEach(([key, value]) => {
              const playerNumber = (parseInt(key) + 1).toString();
              Object.entries(value).forEach(([property, value]) => {
                key = `players/${playerNumber}/${property}`;
                const variable = currentCollectionVariables.find(
                  (v) => v && v.name === key,
                );
                if (variable) {
                  variable.setValueForMode(darkModeId, parseHex(value));
                }
              });
            });
          } else if (!lightThemeStylePlayers) {
            Object.entries(darkThemeStylePlayers).forEach(([key, value]) => {
              Object.entries(value).forEach(([property, value]) => {
                const playerNumber = (parseInt(key) + 1).toString();
                const variable = figma.variables.createVariable(
                  `players/${playerNumber}/${property}`,
                  collection,
                  "COLOR",
                );
                variable.setValueForMode(darkModeId, parseHex(value));
              });
            });
          }
        }

        notification.cancel();
      } catch (error) {
        console.error(`Error creating collection: \n ${error.message}`);
        figma.notify("Error creating collection");
      }

      figma.closePlugin();
    } else if (msg.type === "cancel") {
      figma.closePlugin();
    }
  } catch (error) {
    console.error(error);
    figma.closePlugin();
  }
};
