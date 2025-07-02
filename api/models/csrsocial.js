const moment = require("moment-timezone");
const mongoose = require("mongoose");
const { LanguageListType } = require("../helper/types");
const defaultDate = moment.tz(Date.now(), "Asia/Jakarta");

const csrSocialSchema = new mongoose.Schema({
  title: LanguageListType("string"),
  description: LanguageListType("string"),
  images: [LanguageListType("image")],
  active_status: {
    type: Boolean,
    default: false,
  },
  order: {
    type: Number,
    default: 0,
  },
  organization_id: {
    type: String,
  },
  created_at: {
    type: Date,
    default: defaultDate,
  },
  created_by: {
    type: String,
    ref: "User",
  },
  updated_at: Date,
  updated_by: {
    type: String,
    ref: "User",
  },
  deleted_time: Date,
  deleted_by: String,
});

const CSRSocial = mongoose.model("CSRSocial", csrSocialSchema, "csr_social");

module.exports = CSRSocial;