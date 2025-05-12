class LimitStage {
  static basic(size: number) {
    return {
      $limit: size,
    };
  }
}

export default LimitStage;
