import { NextFunction, Request, Response } from "express";
import Group from "../../Models/Group";
import HTTPError from "../../libs/HTTPError";
import { groupSchema } from "../../validators/ZodSchemas";

export const getGroups = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const groups = await Group.findAll();
    res.status(200).json({ groups });
  } catch (err: any) {
    HTTPError.handleControllerError(err, next);
  }
};

export const getOneGroup = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const groupId = Number(req.params.groupId);
    if (isNaN(groupId)) {
      throw new HTTPError(400, "Invalid group ID");
    }

    const group = new Group(groupId);
    const groupData = await group.findById();
    res.status(200).json({ groupData });
  } catch (err: any) {
    HTTPError.handleControllerError(err, next);
  }
};

export const createGroup = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { name } = groupSchema.parse(req.body);
    const group = new Group(null, name);
    const groupData = await group.create();
    res.status(201).json({ groupData });
  } catch (err: any) {
    HTTPError.handleControllerError(err, next);
  }
};

export const updateGroup = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const groupId = Number(req.params.groupId);
    if (isNaN(groupId)) {
      throw new HTTPError(400, "Invalid group ID");
    }
    const { name } = groupSchema.parse(req.body);
    const group = new Group(groupId, name);
    const groupData = await group.update();
    res.status(200).json({ groupData });
  } catch (err: any) {
    HTTPError.handleControllerError(err, next);
  }
};

export const deleteGroup = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const groupId = Number(req.params.groupId);
    if (isNaN(groupId)) {
      throw new HTTPError(400, "Invalid group ID");
    }
    const group = new Group(groupId);
    const groupData = await group.destroy();
    res.status(200).json({ groupData });
  } catch (err: any) {
    HTTPError.handleControllerError(err, next);
  }
};
