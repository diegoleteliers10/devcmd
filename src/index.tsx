import { ActionPanel, Form, Action, useNavigation } from "@raycast/api";
import fs from "fs";
import Commands from "./commands";

export default function Command() {
  const { push } = useNavigation();

  return (
    <Form
      actions={
        <ActionPanel>
          <Action.SubmitForm
            title="Select Folder"
            onSubmit={(values: { files: string[] }) => {
              // Filtrar para obtener solo carpetas
              const folders = values.files.filter((path: string) => {
                try {
                  return fs.existsSync(path) && fs.lstatSync(path).isDirectory();
                } catch (error) {
                  return error;
                }
              });

              if (folders.length > 0) {
                // Tomar la primera carpeta seleccionada
                const selectedFolder = folders[0];
                // Navegar a commands.tsx pasando el path de la carpeta
                push(<Commands folderPath={selectedFolder} />);
              }
            }}
          />
        </ActionPanel>
      }
    >
      <Form.FilePicker
        id="files"
        title="Select Folder"
        allowMultipleSelection={false}
        canChooseDirectories={true}
        canChooseFiles={false}
      />
    </Form>
  );
}
