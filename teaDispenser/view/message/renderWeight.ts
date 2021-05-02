import _ from "lodash";

function renderWeight(weight: number): string {
  return _.round(weight, 1).toString();
}

export default renderWeight;
