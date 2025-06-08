import { SortOrderType } from "@types";

class SortStage {
  static createdAt(order: SortOrderType) {
    return {
      $sort: { createdAt: order },
    };
  }

  static views(order: SortOrderType) {
    return {
      $sort: { "actions.views": order },
    };
  }

  static repostedAt(order: SortOrderType) {
    return {
      $sort: { repostedAt: order },
    };
  }

  static sortKey(order: SortOrderType) {
    return {
      $sort: {
        sortKey: order,
      },
    };
  }
}

export default SortStage;
