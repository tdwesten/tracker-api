import { DataTypes, Model } from "https://deno.land/x/denodb@v1.1.0/mod.ts";

export class MetricSchema extends Model {
  // database table name
  static table = "metrics";

  // add timestamps (updatedAt, createdAt)
  static timestamps = true;

  // fields definition
  static fields = {
    name: DataTypes.STRING,
    units: DataTypes.STRING,
    qty: DataTypes.FLOAT,
    source: DataTypes.STRING,
  };

  // default values
  static defaults = {
    source: null,
  };
}
