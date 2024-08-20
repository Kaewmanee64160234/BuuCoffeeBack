import { Injectable } from '@nestjs/common';
import { CreateIngredientusagelogDto } from './dto/create-ingredientusagelog.dto';
import { UpdateIngredientusagelogDto } from './dto/update-ingredientusagelog.dto';
import { Checkingredient } from 'src/checkingredients/entities/checkingredient.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Checkingredientitem } from 'src/checkingredientitems/entities/checkingredientitem.entity';
import { Ingredient } from 'src/ingredients/entities/ingredient.entity';
import { IngredientUsageLog } from './entities/ingredientusagelog.entity';

@Injectable()
export class IngredientusagelogService {
  constructor(
    @InjectRepository(Checkingredient)
    private readonly checkingredientRepository: Repository<Checkingredient>,

    @InjectRepository(Checkingredientitem)
    private readonly checkingredientitemRepository: Repository<Checkingredientitem>,

    @InjectRepository(Ingredient)
    private readonly ingredientRepository: Repository<Ingredient>,

    @InjectRepository(IngredientUsageLog)
    private readonly ingredientUsageLogRepository: Repository<IngredientUsageLog>,
  ) {}
  // async getWithdrawalReturnPairsWithLogs(): Promise<any[]> {
  //   const query = this.checkingredientRepository
  //     .createQueryBuilder('w')
  //     .select([
  //       'w.CheckID AS WithdrawalID',
  //       'r.CheckID AS ReturnID',
  //       'w.date AS WithdrawalDate',
  //       'r.date AS ReturnDate',
  //       'w.shopType',
  //       'w.checkDescription AS WithdrawalDescription',
  //       'r.checkDescription AS ReturnDescription',
  //       'ciitem.ingredientIngredientId',
  //       'i.ingredientName',
  //       'ciitem.UsedQuantity AS WithdrawalQuantity',
  //       'ritem.UsedQuantity AS ReturnQuantity',
  //       'ritem.oldRemain AS ReturnOldRemain',
  //     ])
  //     .innerJoin(
  //       'Checkingredientitem',
  //       'ciitem',
  //       'w.CheckID = ciitem.checkingredientCheckID',
  //     )
  //     .innerJoin(
  //       'Ingredient',
  //       'i',
  //       'ciitem.ingredientIngredientId = i.ingredientId',
  //     )
  //     .innerJoin(
  //       'Checkingredient',
  //       'r',
  //       'r.shopType = w.shopType AND r.actionType = :actionType',
  //       { actionType: 'return' },
  //     )
  //     .innerJoin(
  //       'Checkingredientitem',
  //       'ritem',
  //       'r.CheckID = ritem.checkingredientCheckID AND ritem.ingredientIngredientId = ciitem.ingredientIngredientId',
  //     )
  //     .where('w.actionType = :actionType', { actionType: 'withdrawal' })
  //     .andWhere('w.date < r.date')
  //     .andWhere(
  //       'NOT EXISTS (SELECT 1 FROM Checkingredient r2 WHERE r2.shopType = w.shopType AND r2.actionType = :actionType AND r2.date < r.date AND r2.date > w.date AND r2.CheckID <> r.CheckID)',
  //       { actionType: 'return' },
  //     )
  //     .getRawMany();

  //   const result = await Promise.all(
  //     (
  //       await query
  //     ).map(async (row) => {
  //       const logs = await this.ingredientUsageLogRepository
  //         .createQueryBuilder('log')
  //         .select([
  //           'SUM(log.usedQuantity) AS TotalUsedLogQuantity',
  //           'SUM(log.unit) AS TotalUnit',
  //           'MAX(log.createdAt) AS LastLogCreatedDate',
  //         ])
  //         .where('log.ingredientIngredientId = :ingredientId', {
  //           ingredientId: row.ingredientIngredientId,
  //         })
  //         .andWhere('log.createdAt BETWEEN :startDate AND :endDate', {
  //           startDate: row.WithdrawalDate,
  //           endDate: row.ReturnDate,
  //         })
  //         .getRawOne();

  //       return {
  //         ...row,
  //         TotalUsedLogQuantity: logs.TotalUsedLogQuantity || 0,
  //         TotalUnit: logs.TotalUnit || 0,
  //         LastLogCreatedDate: logs.LastLogCreatedDate || null,
  //       };
  //     }),
  //   );

  //   return result;
  // }
  async getWithdrawalReturnPairsWithLogs(): Promise<any[]> {
    const query = `
      WITH WithdrawalReturnPairs AS (
          SELECT
              w.CheckID AS WithdrawalID,
              r.CheckID AS ReturnID,
              w.date AS WithdrawalDate,
              r.date AS ReturnDate,
              w.shopType,
              w.checkDescription AS WithdrawalDescription,
              r.checkDescription AS ReturnDescription,
              ciitem.ingredientIngredientId,
              i.ingredientName,
              ciitem.UsedQuantity AS WithdrawalQuantity,
              ritem.UsedQuantity AS ReturnQuantity,
              ritem.oldRemain AS ReturnOldRemain
          FROM 
              Checkingredient w
          INNER JOIN 
              Checkingredientitem ciitem ON w.CheckID = ciitem.checkingredientCheckID
          INNER JOIN 
              Ingredient i ON ciitem.ingredientIngredientId = i.ingredientId
          INNER JOIN 
              Checkingredient r ON r.shopType = w.shopType 
              AND r.actionType = 'return'
          INNER JOIN 
              Checkingredientitem ritem ON r.CheckID = ritem.checkingredientCheckID 
              AND ritem.ingredientIngredientId = ciitem.ingredientIngredientId
          WHERE 
              w.actionType = 'withdrawal' 
              AND w.date < r.date
              AND NOT EXISTS (
                  SELECT 1
                  FROM Checkingredient r2
                  WHERE r2.shopType = w.shopType
                    AND r2.actionType = 'return'
                    AND r2.date < r.date
                    AND r2.date > w.date
                    AND r2.CheckID <> r.CheckID
              )
      )
      SELECT 
          p.WithdrawalID,
          p.ReturnID,
          p.WithdrawalDate,
          p.ReturnDate,
          p.shopType,
          p.ingredientIngredientId,
          p.ingredientName,
          p.WithdrawalQuantity,
          p.ReturnQuantity,
          COALESCE(SUM(log.usedQuantity), 0) AS TotalUsedLogQuantity,
          COALESCE(SUM(log.unit), 0) AS TotalUnit,
          MAX(log.createdAt) AS LastLogCreatedDate
      FROM 
          WithdrawalReturnPairs p
      LEFT JOIN 
          ingredient_usage_log log 
          ON p.ingredientIngredientId = log.ingredientIngredientId
          AND log.createdAt BETWEEN p.WithdrawalDate AND p.ReturnDate
      GROUP BY 
          p.WithdrawalID,
          p.ReturnID,
          p.WithdrawalDate,
          p.ReturnDate,
          p.shopType,
          p.ingredientIngredientId,
          p.ingredientName,
          p.WithdrawalQuantity,
          p.ReturnQuantity
      ORDER BY 
          p.WithdrawalDate, p.ingredientName, p.ReturnDate;
    `;

    return await this.ingredientUsageLogRepository.query(query);
  }
  create(createIngredientusagelogDto: CreateIngredientusagelogDto) {
    return 'This action adds a new ingredientusagelog';
  }

  findAll() {
    return `This action returns all ingredientusagelog`;
  }

  findOne(id: number) {
    return `This action returns a #${id} ingredientusagelog`;
  }

  update(id: number, updateIngredientusagelogDto: UpdateIngredientusagelogDto) {
    return `This action updates a #${id} ingredientusagelog`;
  }

  remove(id: number) {
    return `This action removes a #${id} ingredientusagelog`;
  }
}
