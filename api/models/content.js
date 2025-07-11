const moment = require("moment-timezone");
const mongoose = require("mongoose");
const { LanguageListType } = require("../helper/types");
const defaultDate = moment.tz(Date.now(), "Asia/Jakarta");

const CONTENT_TYPE = {
  business: 1,
  news: 2,
  career: 3,
  about_profile: 4,
  investor: 5,
  annual_report: 6,
  sustainability_report: 7,
  procurement_information: 8,
  business_page: 9,
  news_page: 10,
  career_page: 11,
  about_management: 12,
  about_hsse: 13,
  about_preemployment: 14,
  about_value: 15,
  about_reward: 16,
  mitra: 17,
  mitra_page: 18,
  sub_company: 19,
  csr: 20,
  csr_list: 21,
  csr_content: 22,
  bazma: 23,
  company_report: 24,
};

const BODY_TYPE = {
  image_right: 1,
  image_left: 2,
  image_bottom: 3,
  image_up: 4,
  full_image: 5,
  full_text_center: 6,
  multiple_image: 7, //(max 2)
};
const BODY_IMAGE_SIZE = {
  s: 1,
  l: 2,
};
const contentSchema = new mongoose.Schema({
  meta_title: LanguageListType("string"),
  meta_description: LanguageListType("string"),
  type: {
    type: Number,
    default: CONTENT_TYPE.business,
  },
  slug: {
    type: String,
  },
  // for each type page
  small_text: LanguageListType("string"),
  //for homepage
  small_text2: LanguageListType("string"),
  title: LanguageListType("string"),
  sub_title1: LanguageListType("string"),
  sub_title2: LanguageListType("string"),
  sub_title3: LanguageListType("string"),
  description: LanguageListType("string"),
  page_title: LanguageListType("string"),
  banner: [LanguageListType("image")],
  use_list: {
    type: Boolean,
    default: false,
  },
  show_on_homepage: {
    type: Boolean,
    default: false,
  },
  body: [
    {
      type: {
        type: Number,
        default: BODY_TYPE.image_up,
      },
      title: LanguageListType("string"),
      absolute: {
        type: Boolean,
      },
      text: LanguageListType("string"),
      top: {
        type: Number,
      },
      left: {
        type: Number,
      },
      image_size: {
        type: Number,
        default: BODY_IMAGE_SIZE.l,
      },
      images: [LanguageListType("image")],
      lists: [
        {
          title: LanguageListType("string"),
          description: LanguageListType("string"),
        },
      ],
      button_name: LanguageListType("string"),
      button_route: {
        type: String,
      },
    },
  ],
  body2: [
    {
      title: LanguageListType("string"),
      text: LanguageListType("string"),
    },
  ],
  bottom_text: LanguageListType("string"),
  bottom_button_name: LanguageListType("string"),
  bottom_button_route: {
    type: String,
  },
  bottom_text2: LanguageListType("string"),
  bottom_description2: LanguageListType("string"),
  active_status: {
    type: Boolean,
    default: false,
  },
  total_view: {
    type: Number,
    default: 0,
  },
  order: {
    type: Number,
    default: 0,
  },
  images: [LanguageListType("image")],
  images2: [LanguageListType("image")],
  // for each type page
  thumbnail_images: [LanguageListType("image")],
  //for homepage
  thumbnail_images2: [LanguageListType("image")],
  jam_kerja: { type: String },
  related: [
    {
      type: String,
      ref: "Content",
    },
  ],
  related2: [
    {
      type: String,
      ref: "Content",
    },
  ],
  group_by: {
    type: String,
  },
  category: {
    type: Number,
  },
  category_id: {
    type: String,
    ref: "Category",
  },
  calendar_key: {
    type: String,
  },
  publish_date: {
    type: Date,
  },

  // Sustainability commitment fields for CSR content
  sustainability_commitment_title: LanguageListType("string"),
  sustainability_commitment_ceo_name: LanguageListType("string"),
  sustainability_commitment_ceo_position: LanguageListType("string"),
  sustainability_commitment_ceo_image: [LanguageListType("image")],
  sustainability_commitment_ceo_quote: LanguageListType("string"),

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

contentSchema.static("BODY_IMAGE_SIZE", function () {
  return BODY_IMAGE_SIZE;
});

contentSchema.static("BODY_TYPE", function () {
  return BODY_TYPE;
});

contentSchema.static("CONTENT_TYPE", function () {
  return CONTENT_TYPE;
});

contentSchema.static("findBySlug", function (slug) {
  return this.findOne({
    slug: slug,
  });
});

const Content = mongoose.model("Content", contentSchema, "content");

module.exports = Content;
