class SkipStage {
  static skipPage(pageNum: number, pageSize: number) {
    return {
      $skip: pageNum * pageSize,
    };
  }
}

export default SkipStage;
