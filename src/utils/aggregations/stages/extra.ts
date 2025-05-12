import { ClientSession } from "mongoose";

class Extra {
  static addSession = (session?: ClientSession) => {
    return { session };
  };
}

export default Extra;
