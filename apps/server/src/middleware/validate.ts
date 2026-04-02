import type { NextFunction, Request, Response } from "express"
import type { AnyZodObject, ZodTypeAny } from "zod"

interface SchemaBundle {
  body?: AnyZodObject | ZodTypeAny
  params?: AnyZodObject | ZodTypeAny
  query?: AnyZodObject | ZodTypeAny
}

export function validate(schema: SchemaBundle) {
  return (req: Request, res: Response, next: NextFunction): Response | void => {
    const issues: Array<{ source: string; field: string; message: string }> = []

    if (schema.body) {
      const result = schema.body.safeParse(req.body)
      if (result.success) req.body = result.data
      else {
        issues.push(
          ...result.error.issues.map((issue) => ({
            source: "body",
            field: issue.path.join(".") || "body",
            message: issue.message
          }))
        )
      }
    }

    if (schema.params) {
      const result = schema.params.safeParse(req.params)
      if (result.success) req.params = result.data
      else {
        issues.push(
          ...result.error.issues.map((issue) => ({
            source: "params",
            field: issue.path.join(".") || "params",
            message: issue.message
          }))
        )
      }
    }

    if (schema.query) {
      const result = schema.query.safeParse(req.query)
      if (result.success) req.query = result.data
      else {
        issues.push(
          ...result.error.issues.map((issue) => ({
            source: "query",
            field: issue.path.join(".") || "query",
            message: issue.message
          }))
        )
      }
    }

    if (issues.length > 0) {
      return res.status(400).json({
        error: "Validation failed",
        issues
      })
    }

    next()
  }
}
