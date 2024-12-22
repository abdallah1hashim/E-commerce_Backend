import { Request, Response, NextFunction } from "express";
import ResourceService from "../services/ResourceService";
import HTTPError from "../libs/HTTPError";
import { ResourceType } from "../types/types";

export const checkOwnership = (resourceType: ResourceType) => {
  return async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const userId = req.userId;
      const resourceId = req.params.id
        ? Number(req.params.id)
        : Number(req.body.id);

      const resource = await ResourceService.getById(resourceType, resourceId);

      if (!resource) {
        throw new HTTPError(404, `${resourceType} not found`);
      }

      if (resource.userId !== userId) {
        throw new HTTPError(403, `You do not own this ${resourceType}`);
      }

      next();
    } catch (err) {
      next(err);
    }
  };
};
