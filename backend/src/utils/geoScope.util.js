/**
 * Jurisdiction Geo-Scoping Utility
 * Directly translates Laravel's `HasGeoScope` trait into Prisma query filters.
 *
 * Scopes records based on user role and assigned jurisdictions:
 * - ADMIN: Full access (unrestricted)
 * - OFFICIAL / WARD OFFICER: Scoped to assigned wardIds, constituencyIds, or corporationIds
 * - VEHICLE / DRIVER: Scoped to vehicle's assigned constituencyIds or userId
 * - CITIZEN (USER): Scoped to user's own requests
 */

export function applyGeoScope(user, baseWhere = {}, entityType = "plant") {
  if (!user) return baseWhere;

  // 1. ADMIN has unrestricted global access
  if (user.role === "ADMIN") {
    return { ...baseWhere };
  }

  const where = { ...baseWhere };

  // 2. Ward Officer Scoping (Most granular)
  if (user.wardIds && Array.isArray(user.wardIds) && user.wardIds.length > 0) {
    if (entityType === "request" || entityType === "ward") {
      where.wardId = { in: user.wardIds };
      return where;
    }
  }

  // 3. Constituency Scoping (AGM / Zonal Officer)
  if (user.constituencyIds && Array.isArray(user.constituencyIds) && user.constituencyIds.length > 0) {
    if (entityType === "plant" || entityType === "request") {
      where.constituencyId = { in: user.constituencyIds };
      return where;
    }

    if (entityType === "ward" || entityType === "constituency") {
      where.id = { in: user.constituencyIds };
      return where;
    }

    if (entityType === "vehicle") {
      // Vehicle has integer array constituencyIds: Int[]
      where.constituencyIds = { hasSome: user.constituencyIds };
      return where;
    }
  }

  // 4. Corporation Scoping (DGM / City Officer)
  if (user.corporationIds && Array.isArray(user.corporationIds) && user.corporationIds.length > 0) {
    if (entityType === "plant" || entityType === "request") {
      where.corporationId = { in: user.corporationIds };
      return where;
    }

    if (entityType === "constituency") {
      where.corporationId = { in: user.corporationIds };
      return where;
    }

    if (entityType === "ward") {
      where.constituency = {
        corporationId: { in: user.corporationIds },
      };
      return where;
    }

    if (entityType === "corporation") {
      where.id = { in: user.corporationIds };
      return where;
    }
  }

  // 5. Driver / Vehicle Scoping
  if (user.role === "VEHICLE") {
    if (entityType === "vehicle") {
      where.userId = user.id;
      return where;
    }

    if (entityType === "request") {
      where.vehicle = { userId: user.id };
      return where;
    }

    if (entityType === "dump") {
      where.vehicle = { userId: user.id };
      return where;
    }
  }

  // 6. Citizen Scoping (Can only view their own requests)
  if (user.role === "USER") {
    if (entityType === "request") {
      where.userId = user.id;
      return where;
    }
  }

  return where;
}

/**
 * Checks if a specific record is within the authenticated user's jurisdiction.
 */
export function isWithinJurisdiction(user, record, entityType = "plant") {
  if (!user) return false;
  if (user.role === "ADMIN") return true;

  if (user.wardIds?.length > 0 && record.wardId) {
    return user.wardIds.includes(record.wardId);
  }

  if (user.constituencyIds?.length > 0) {
    if (record.constituencyId) {
      return user.constituencyIds.includes(record.constituencyId);
    }
    if (record.constituencyIds && Array.isArray(record.constituencyIds)) {
      return record.constituencyIds.some((id) => user.constituencyIds.includes(id));
    }
  }

  if (user.corporationIds?.length > 0 && record.corporationId) {
    return user.corporationIds.includes(record.corporationId);
  }

  return false;
}
