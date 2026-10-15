export const validate = (schema) => (req, res, next) => {
  try {
    req.body = schema.parse(req.body);
    next();
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: "Validation Error",
      errors: error.errors?.map((e) => ({ field: e.path.join("."), message: e.message })) || error.message,
    });
  }
};

export const validateQuery = (schema) => (req, res, next) => {
  try {
    const parsed = schema.parse(req.query);
    req.validatedQuery = parsed;
    // Safely update properties of req.query object without reassigning getter in Express 5
    for (const key of Object.keys(req.query)) {
      delete req.query[key];
    }
    Object.assign(req.query, parsed);
    next();
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: "Query Validation Error",
      errors: error.errors?.map((e) => ({ field: e.path.join("."), message: e.message })) || error.message,
    });
  }
};
