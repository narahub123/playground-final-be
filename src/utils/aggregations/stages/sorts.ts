import { SortOrderType } from "@types";

class SortStage {
  static createdAt(order: SortOrderType) {
    return {
      $sort: { createdAt: order },
    };
  }

  static repostedAt(order: SortOrderType) {
    return {
      $sort: { repostedAt: order },
    };
  }
}

export default SortStage;
