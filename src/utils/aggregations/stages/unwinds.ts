class UnwindStage {
  static simple(path: string) {
    return {
      $unwind: `$${path}`,
    };
  }

  static unwind(path: string) {
    return {
      $unwind: { path: `$${path}`, preserveNullAndEmptyArrays: true },
    };
  }
}

export default UnwindStage;
