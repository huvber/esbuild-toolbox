export const dynamicImportsFromMeta = (metafile = {}) => {
  const filesData = Object.values(metafile.outputs ?? {});

  return filesData.flatMap((fileData) => {
    if (!fileData.imports) return [];

    return fileData.imports
      .filter((importObj) => importObj.kind === "dynamic-import")
      .map(({ path }) => path);
  });
};
