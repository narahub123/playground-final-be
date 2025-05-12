class ReplaceRootStage {
  static replaceRoot(newRoot: string) {
    return { $replaceRoot: { newRoot: `$${newRoot}` } };
  }
}

export default ReplaceRootStage;
