const { convertData } = require("../helper/convert");
const response = require("../helper/response");
const { filterObjectID, regexWithSymbol } = require("../helper/stringmod");
const { i18n, default_lang } = require("../locales");
const models = require("../models");
const moment = require("moment");

const CONTROLLER = {
  id: "Program Sosial CSR",
  en: "CSR Social Program",
};

const sortByOrder = (items) => {
  if (!items || !Array.isArray(items)) return items;
  return [...items].sort((a, b) => {
    const orderA = a.order !== undefined ? Number(a.order) : 0;
    const orderB = b.order !== undefined ? Number(b.order) : 0;
    return orderA - orderB;
  });
};

const Controller = {
  // Admin API: Get all CSR social programs for CMS management
  getAdmin: async function (req, res) {
    try {
      const {
        page = 1,
        limit = 20,
        active_status,
        query,
        sort_by = 1,
        sort_at = "order",
        show_single_language,
      } = req.query;

      let filter = {
        deleted_time: {
          $exists: false,
        },
      };

      if (query) {
        filter.$or = [
          {
            [`title.${default_lang(req.headers)}`]: {
              $regex: new RegExp(regexWithSymbol(query), "i"),
            },
          },
          {
            [`description.${default_lang(req.headers)}`]: {
              $regex: new RegExp(regexWithSymbol(query), "i"),
            },
          },
        ];
      }

      if (active_status !== undefined) filter.active_status = active_status === 'true';

      if (req?.me?.organization_id || req.headers?.organizationid)
        filter.organization_id =
          req?.me?.organization_id ?? req.headers?.organizationid;

      const maxLimit = Math.min(+limit, 50);
      const sort = {
        sort: { [sort_at]: +sort_by },
        skip: (+page - 1) * maxLimit,
        limit: maxLimit,
      };

      let socialPrograms = await models.CSRSocial.find(filter, null, sort)
        .populate({
          path: 'created_by',
          select: 'name email'
        })
        .populate({
          path: 'updated_by',
          select: 'name email'
        });

      // Manual populate images with URLs (safe version)
      for (let i = 0; i < socialPrograms.length; i++) {
        const program = socialPrograms[i];
        const programObj = program.toObject ? program.toObject() : program;
        
        if (programObj.images && Array.isArray(programObj.images)) {
          for (let j = 0; j < programObj.images.length; j++) {
            const imgRef = programObj.images[j];
            
            // Safely extract image ID
            let imageId = null;
            if (typeof imgRef.id === 'string' && imgRef.id.length === 24) {
              imageId = imgRef.id;
            } else if (imgRef.id && typeof imgRef.id === 'object' && imgRef.id.toString) {
              const idString = imgRef.id.toString();
              if (idString.length === 24 && idString !== '[object Object]') {
                imageId = idString;
              }
            }
            
            if (imageId) {
              try {
                const imageData = await models.Image.findById(imageId)
                  .select('images.url images_mobile.url title description')
                  .lean();
                
                if (imageData && imageData.images && imageData.images.length > 0) {
                  programObj.images[j] = {
                    ...imgRef,
                    url: imageData.images[0].url,
                    title: imageData.title || `CSR Program Image ${j + 1}`,
                    description: imageData.description || `Image for ${programObj.title?.id || 'CSR Program'}`
                  };
                } else {
                  // Keep original structure if image not found
                  programObj.images[j] = imgRef;
                }
              } catch (error) {
                console.error(`Error fetching image ${imageId}:`, error.message);
                // Keep original structure on error
                programObj.images[j] = imgRef;
              }
            } else {
              // Keep original structure if ID invalid
              programObj.images[j] = imgRef;
            }
          }
          programObj.images = sortByOrder(programObj.images);
        }
        
        socialPrograms[i] = programObj;
      }

      const total_data = await models.CSRSocial.countDocuments(filter);
      const total_pages = Math.ceil(total_data / maxLimit);
      const pages = {
        current_page: parseInt(page),
        total_pages,
        total_data,
        per_page: maxLimit,
      };

      if (show_single_language == "yes") {
        socialPrograms = JSON.parse(JSON.stringify(socialPrograms));
        for (let i = 0; i < socialPrograms.length; i++)
          socialPrograms[i] = convertData(socialPrograms[i], req.headers);
      }

      return response.ok(socialPrograms, res, `Success`, pages);
    } catch (error) {
      console.error("Error in getAdmin:", error);
      return response.error(500, error.message, res, error);
    }
  },

  // Public API: Get CSR social programs for frontend
  get: async function (req, res) {
    try {
      const {
        page = 1,
        limit = 10,
        active_status = true,
        show_single_language,
      } = req.query;

      let filter = {
        deleted_time: {
          $exists: false,
        },
        active_status: true, // Only show active programs for public
      };

      if (req?.me?.organization_id || req.headers?.organizationid)
        filter.organization_id =
          req?.me?.organization_id ?? req.headers?.organizationid;

      const maxLimit = Math.min(+limit, 50);
      const sort = {
        sort: { order: 1 },
        skip: (+page - 1) * maxLimit,
        limit: maxLimit,
      };

      let socialPrograms = await models.CSRSocial.find(filter, null, sort);
      
      // Manual populate images with URLs (safe version)
      for (let i = 0; i < socialPrograms.length; i++) {
        const program = socialPrograms[i];
        const programObj = program.toObject ? program.toObject() : program;
        
        if (programObj.images && Array.isArray(programObj.images)) {
          for (let j = 0; j < programObj.images.length; j++) {
            const imgRef = programObj.images[j];
            
            // Safely extract image ID
            let imageId = null;
            if (typeof imgRef.id === 'string' && imgRef.id.length === 24) {
              imageId = imgRef.id;
            } else if (imgRef.id && typeof imgRef.id === 'object' && imgRef.id.toString) {
              const idString = imgRef.id.toString();
              if (idString.length === 24 && idString !== '[object Object]') {
                imageId = idString;
              }
            }
            
            if (imageId) {
              try {
                const imageData = await models.Image.findById(imageId)
                  .select('images.url images_mobile.url title description')
                  .lean();
                
                if (imageData && imageData.images && imageData.images.length > 0) {
                  programObj.images[j] = {
                    ...imgRef,
                    url: imageData.images[0].url,
                    title: imageData.title || `CSR Program Image ${j + 1}`,
                    description: imageData.description || `Image for ${programObj.title?.id || 'CSR Program'}`
                  };
                } else {
                  // Keep original structure if image not found
                  programObj.images[j] = imgRef;
                }
              } catch (error) {
                console.error(`Error fetching image ${imageId}:`, error.message);
                // Keep original structure on error
                programObj.images[j] = imgRef;
              }
            } else {
              // Keep original structure if ID invalid
              programObj.images[j] = imgRef;
            }
          }
        }
        
        socialPrograms[i] = programObj;
      }

      const total_data = await models.CSRSocial.countDocuments(filter);
      const total_pages = Math.ceil(total_data / maxLimit);
      const pages = {
        current_page: parseInt(page),
        total_pages,
        total_data,
        per_page: maxLimit,
      };

      if (show_single_language == "yes") {
        socialPrograms = JSON.parse(JSON.stringify(socialPrograms));
        for (let i = 0; i < socialPrograms.length; i++)
          socialPrograms[i] = convertData(socialPrograms[i], req.headers);
      }

      return response.ok(socialPrograms, res, `Success`, pages);
    } catch (error) {
      console.error("Error in get:", error);
      return response.error(500, error.message, res, error);
    }
  },

  // Admin API: Get single CSR social program for editing
  getDetail: async function (req, res) {
    try {
      const { program_id } = req.params;

      let filter = {
        deleted_time: {
          $exists: false,
        },
      };

      const validID = filterObjectID(program_id);
      if (validID) {
        filter._id = validID;
      } else {
        return response.error(400, "Invalid program ID", res);
      }

      if (req?.me?.organization_id || req.headers?.organizationid)
        filter.organization_id =
          req?.me?.organization_id ?? req.headers?.organizationid;

      let socialProgram = await models.CSRSocial.findOne(filter)
        .populate({
          path: 'created_by',
          select: 'name email'
        })
        .populate({
          path: 'updated_by',
          select: 'name email'
        });

      if (socialProgram) {
        // Manual populate images with URLs (safe version)
        const programObj = socialProgram.toObject();
        
        if (programObj.images && Array.isArray(programObj.images)) {
          for (let j = 0; j < programObj.images.length; j++) {
            const imgRef = programObj.images[j];
            
            // Safely extract image ID
            let imageId = null;
            if (typeof imgRef.id === 'string' && imgRef.id.length === 24) {
              imageId = imgRef.id;
            } else if (imgRef.id && typeof imgRef.id === 'object' && imgRef.id.toString) {
              const idString = imgRef.id.toString();
              if (idString.length === 24 && idString !== '[object Object]') {
                imageId = idString;
              }
            }
            
            if (imageId) {
              try {
                const imageData = await models.Image.findById(imageId)
                  .select('images.url images_mobile.url title description')
                  .lean();
                
                if (imageData && imageData.images && imageData.images.length > 0) {
                  programObj.images[j] = {
                    ...imgRef,
                    url: imageData.images[0].url,
                    title: imageData.title || `CSR Program Image ${j + 1}`,
                    description: imageData.description || `Image for ${programObj.title?.id || 'CSR Program'}`
                  };
                } else {
                  // Keep original structure if image not found
                  programObj.images[j] = imgRef;
                }
              } catch (error) {
                console.error(`Error fetching image ${imageId}:`, error.message);
                // Keep original structure on error
                programObj.images[j] = imgRef;
              }
            } else {
              // Keep original structure if ID invalid
              programObj.images[j] = imgRef;
            }
          }
        }
        
        socialProgram = programObj;
      }

      if (!socialProgram) {
        return response.error(
          404,
          i18n(
            `NotFound {{name}}`,
            { name: CONTROLLER[default_lang(req.headers)] },
            default_lang(req.headers),
            "general"
          ),
          res
        );
      }

      return response.ok(
        socialProgram,
        res,
        i18n(`Success`, {}, req.headers["accept-language"], "general")
      );
    } catch (error) {
      console.error("Error in getDetail:", error);
      return response.error(500, error.message, res, error);
    }
  },

  // Create new CSR social program
  add: async function (req, res) {
    try {
      const current_date = moment().tz("Asia/Jakarta").format();
      let {
        title,
        description,
        images = [],
        thumbnail_images = [],
        active_status = true,
        order = 0,
        meta_title,
        meta_description,
      } = req.body;

      // Validation
      if (!title || !title.id || !title.en) {
        return response.error(
          400,
          i18n(
            `Field Required`,
            { field: "Title (ID & EN)" },
            req.headers["accept-language"],
            "general"
          ),
          res
        );
      }

      if (!description || !description.id || !description.en) {
        return response.error(
          400,
          i18n(
            `Field Required`,
            { field: "Description (ID & EN)" },
            req.headers["accept-language"],
            "general"
          ),
          res
        );
      }

      const session = await models.CSRSocial.startSession();
      session.startTransaction();

      try {
        const options = { session };

        let new_data = {
          organization_id: req.me?.organization_id || 'default_org',
          created_at: current_date,
          created_by: req.me?._id || 'default_user',
          title,
          description,
          images,
          thumbnail_images,
          active_status,
          order: parseInt(order) || 0,
          meta_title,
          meta_description,
        };

        const savedProgram = await models.CSRSocial(new_data).save(options);

        await session.commitTransaction();
        session.endSession();
        
        return response.ok(
          savedProgram,
          res,
          i18n(`Success`, {}, req.headers["accept-language"], "general")
        );
      } catch (err) {
        await session.abortTransaction();
        session.endSession();
        throw err;
      }
    } catch (error) {
      console.error("Error in add:", error);
      return response.error(400, error.message, res, error);
    }
  },

  // Update CSR social program
  update: async function (req, res) {
    try {
      const current_date = moment().tz("Asia/Jakarta").format();
      const { program_id } = req.params;
      let {
        title,
        description,
        images = [],
        thumbnail_images = [],
        active_status,
        order,
        meta_title,
        meta_description,
      } = req.body;

      const filter = {
        _id: program_id,
        organization_id: req.me?.organization_id || 'default_org',
        deleted_time: {
          $exists: false,
        },
      };

      const socialProgram = await models.CSRSocial.findOne(filter);
      if (!socialProgram)
        return response.error(
          400,
          i18n(
            `NotFound {{name}}`,
            { name: CONTROLLER[default_lang(req.headers)] },
            default_lang(req.headers),
            "general"
          ),
          res
        );

      const session = await models.CSRSocial.startSession();
      session.startTransaction();

      try {
        const options = { session };

        if (title) socialProgram.title = title;
        if (description) socialProgram.description = description;
        
        // Only update images if they are explicitly provided and not empty from status-only updates
        if (images !== undefined && Array.isArray(images)) {
          socialProgram.images = images;
        }
        if (thumbnail_images !== undefined && Array.isArray(thumbnail_images)) {
          socialProgram.thumbnail_images = thumbnail_images;
        }
        
        if (active_status !== undefined) socialProgram.active_status = active_status;
        if (order !== undefined) socialProgram.order = parseInt(order) || 0;
        if (meta_title) socialProgram.meta_title = meta_title;
        if (meta_description) socialProgram.meta_description = meta_description;
        
        socialProgram.updated_at = current_date;
        socialProgram.updated_by = req.me?._id || 'default_user';
        
        await socialProgram.save(options);

        await session.commitTransaction();
        session.endSession();
        
        return response.ok(
          socialProgram,
          res,
          i18n(`Success`, {}, req.headers["accept-language"], "general")
        );
      } catch (err) {
        await session.abortTransaction();
        session.endSession();
        throw err;
      }
    } catch (error) {
      console.error("Error in update:", error);
      return response.error(400, error.message, res, error);
    }
  },

  // Delete CSR social program (soft delete)
  delete: async function (req, res) {
    try {
      const { program_id } = req.params;
      const current_date = moment().tz("Asia/Jakarta").format();

      const session = await models.CSRSocial.startSession();
      session.startTransaction();

      try {
        const options = { session };

        const filter = {
          _id: program_id,
          organization_id: req.me?.organization_id || 'default_org',
          deleted_time: {
            $exists: false,
          },
        };
        
        const new_data = {
          $set: {
            deleted_time: current_date,
            deleted_by: req.me?._id || 'default_user',
            updated_at: undefined,
            updated_by: undefined,
          },
        };
        
        const result = await models.CSRSocial.updateOne(filter, new_data, options);
        
        if (result.modifiedCount === 0) {
          await session.abortTransaction();
          session.endSession();
          return response.error(
            404,
            i18n(
              `NotFound {{name}}`,
              { name: CONTROLLER[default_lang(req.headers)] },
              default_lang(req.headers),
              "general"
            ),
            res
          );
        }

        await session.commitTransaction();
        session.endSession();
        
        return response.ok(
          true,
          res,
          i18n(`Success`, {}, req.headers["accept-language"], "general")
        );
      } catch (err) {
        await session.abortTransaction();
        session.endSession();
        throw err;
      }
    } catch (error) {
      console.error("Error in delete:", error);
      return response.error(400, error.message, res, error);
    }
  },

  // Toggle status only (untuk mencegah gambar hilang)
  toggleStatus: async function (req, res) {
    try {
      const current_date = moment().tz("Asia/Jakarta").format();
      const { program_id } = req.params;
      const { active_status } = req.body;

      if (active_status === undefined) {
        return response.error(400, "active_status is required", res);
      }

      const filter = {
        _id: program_id,
        organization_id: req.me?.organization_id || 'default_org',
        deleted_time: {
          $exists: false,
        },
      };

      const socialProgram = await models.CSRSocial.findOne(filter);
      if (!socialProgram)
        return response.error(
          400,
          i18n(
            `NotFound {{name}}`,
            { name: CONTROLLER[default_lang(req.headers)] },
            default_lang(req.headers),
            "general"
          ),
          res
        );

      // Update only status, do not touch images
      socialProgram.active_status = active_status;
      socialProgram.updated_at = current_date;
      socialProgram.updated_by = req.me?._id || 'default_user';
      
      await socialProgram.save();
      
      return response.ok(
        socialProgram,
        res,
        i18n(`Success`, {}, req.headers["accept-language"], "general")
      );
      
    } catch (error) {
      console.error("Error in toggleStatus:", error);
      return response.error(400, error.message, res, error);
    }
  },

  // Debug function to check data structure
  debug: async function (req, res) {
    try {
      console.log('🐛 Debug endpoint called');
      
      // Get raw data
      const rawPrograms = await models.CSRSocial.find({
        deleted_time: { $exists: false }
      }).limit(1);
      
      // Check available images
      const availableImages = await models.Image.find({
        deleted_time: { $exists: false }
      })
      .select('_id title images.url')
      .limit(3);
      
      // Debug image IDs in CSR programs
      let imageAnalysis = [];
      if (rawPrograms.length > 0 && rawPrograms[0].images) {
        imageAnalysis = rawPrograms[0].images.map(img => ({
          raw_id: img.id,
          id_type: typeof img.id,
          id_string: img.id ? img.id.toString() : null,
          id_length: img.id ? img.id.toString().length : 0,
          is_valid_objectid: img.id && img.id.toString().length === 24
        }));
      }
      
      return response.ok({
        message: 'Debug data',
        raw_programs: rawPrograms,
        available_images: availableImages,
        image_analysis: imageAnalysis,
        model_info: {
          csr_social_count: await models.CSRSocial.countDocuments({ deleted_time: { $exists: false }}),
          image_count: await models.Image.countDocuments({ deleted_time: { $exists: false }})
        }
      }, res, 'Debug Success');
      
    } catch (error) {
      console.error("Error in debug:", error);
      return response.error(500, error.message, res, error);
    }
  },
};

module.exports = Controller;