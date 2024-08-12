import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateImportingredientDto } from './dto/create-importingredient.dto';
import { Importingredient } from './entities/importingredient.entity';
import { Repository, Between } from 'typeorm';
import { Importingredientitem } from 'src/importingredientitems/entities/importingredientitem.entity';
import { Ingredient } from 'src/ingredients/entities/ingredient.entity';
import { User } from 'src/users/entities/user.entity';
import { HttpException, HttpStatus } from '@nestjs/common';
import { Reciept } from 'src/reciept/entities/reciept.entity';
@Injectable()
export class ImportingredientsService {
  constructor(
    @InjectRepository(Importingredient)
    private importingredientRepository: Repository<Importingredient>,
    @InjectRepository(Importingredientitem)
    private importingredientitemRepository: Repository<Importingredientitem>,
    @InjectRepository(Ingredient)
    private ingredientRepository: Repository<Ingredient>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Reciept)
    private readonly recieptRepository: Repository<Reciept>,
  ) {}
  async create(createImportingredientDto: CreateImportingredientDto) {
    const user = await this.userRepository.findOneBy({
      userId: createImportingredientDto.userId,
    });
    if (!user) {
      throw new Error('User not found');
    }

    const importingredient = new Importingredient();
    importingredient.user = user;
    importingredient.date = createImportingredientDto.date;
    importingredient.discount = createImportingredientDto.discount;
    importingredient.store = createImportingredientDto.store;
    importingredient.total = createImportingredientDto.total;
    importingredient.importDescription =
      createImportingredientDto.importDescription;
    importingredient.importStoreType =
      createImportingredientDto.importStoreType;

    const savedImportingredient = await this.importingredientRepository.save(
      importingredient,
    );

    for (const importItemDto of createImportingredientDto.importingredientitem) {
      const importingredientitem = new Importingredientitem();
      importingredientitem.importingredient = savedImportingredient;

      if (importingredient.importStoreType === 'ร้านกาแฟ') {
        //ร้านกาแฟ
        const ingredient = await this.ingredientRepository.findOneBy({
          ingredientId: importItemDto.ingredientId,
        });
        if (!ingredient) {
          throw new Error(
            `Ingredient with ID ${importItemDto.ingredientId} not found`,
          );
        }

        importingredientitem.ingredient = ingredient;
        importingredientitem.pricePerUnit = importItemDto.pricePerUnit;
        importingredientitem.unitPrice = importItemDto.unitPrice;
        importingredientitem.Quantity = importItemDto.Quantity;

        // Update stock
        ingredient.ingredientQuantityInStock += importItemDto.Quantity;
        await this.ingredientRepository.save(ingredient);
      } else if (importingredient.importStoreType === 'ร้านข้าว') {
        //ร้านข้าว
        importingredientitem.name = importItemDto.name;
      }

      await this.importingredientitemRepository.save(importingredientitem);
    }

    return await this.importingredientRepository.findOne({
      where: { importID: savedImportingredient.importID },
      relations: ['importingredientitem'],
    });
  }

  findAll() {
    try {
      return this.importingredientRepository.find({
        relations: [
          'importingredientitem',
          'user',
          'importingredientitem.ingredient',
        ],
      });
    } catch (error) {
      console.error(error);
    }
  }

  async getMinMaxDates(): Promise<{ minDate: Date; maxDate: Date }> {
    try {
      const [minResult, maxResult] = await Promise.all([
        this.importingredientRepository
          .createQueryBuilder('importingredient')
          .select('MIN(importingredient.date)', 'minDate')
          .getRawOne(),
        this.importingredientRepository
          .createQueryBuilder('importingredient')
          .select('MAX(importingredient.date)', 'maxDate')
          .getRawOne(),
      ]);

      return {
        minDate: new Date(minResult.minDate),
        maxDate: new Date(maxResult.maxDate),
      };
    } catch (error) {
      console.error(error);
      throw new Error('Error fetching min and max dates');
    }
  }

  async findDate(startDate?: string, endDate?: string) {
    try {
      const { minDate, maxDate } = await this.getMinMaxDates();
      const start = startDate ? new Date(startDate) : minDate;
      const end = endDate
        ? new Date(endDate)
        : new Date(maxDate.getTime() + 86400000); // เพิ่ม 1 วัน

      const results = await this.importingredientRepository.find({
        relations: [
          'importingredientitem',
          'user',
          'importingredientitem.ingredient',
        ],
        where: {
          date: Between(start, end),
        },
      });
      return results.map((result) => ({
        date: result.date,
        store: result.store,
        discount: result.discount,
        importStoreType: result.importStoreType,
        total: result.total,
      }));
    } catch (error) {
      console.error(error);
      throw new Error('Error fetching data');
    }
  }

  async findOne(id: number) {
    try {
      const importingredient = await this.importingredientRepository.findOne({
        where: { importID: id },
        relations: ['user', 'importingredientitem'],
      });
      if (!importingredient) {
        throw new HttpException(
          'importingredient not found',
          HttpStatus.NOT_FOUND,
        );
      }
      return importingredient;
    } catch (error) {
      throw new HttpException(
        'Failed to fetch reciept',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async remove(id: number) {
    try {
      const importingredient = await this.importingredientRepository.findOne({
        where: { importID: id },
      });
      if (!importingredient) {
        throw new HttpException(
          'importingredient not found',
          HttpStatus.NOT_FOUND,
        );
      }
      return await this.importingredientRepository.remove(importingredient);
    } catch (error) {
      throw new HttpException(
        'Failed to delete importingredient',
        HttpStatus.BAD_REQUEST,
      );
    }
  }
  async getRevenueByPeriod(startDate, endDate) {
    const receipts = await this.recieptRepository
      .createQueryBuilder('reciept')
      .select('DATE(reciept.createdDate) AS date')
      .addSelect('SUM(reciept.receiptNetPrice)', 'totalNetPrice')
      .where('reciept.createdDate BETWEEN :startDate AND :endDate', {
        startDate,
        endDate,
      })
      .groupBy('DATE(reciept.createdDate)')
      .getRawMany();

    const totalRevenue = receipts.reduce(
      (sum, receipt) => sum + parseFloat(receipt.totalNetPrice),
      0,
    );

    return { receipts, totalRevenue };
  }

  async getExpenditureByPeriod(
    startDate: Date,
    endDate: Date,
  ): Promise<{
    startDate: Date;
    endDate: Date;
    // totalExpenditure: number;
    totalExpenditureStartDate: number;
    totalExpenditureEndDate: number;
  }> {
    const importIngredientsStart = await this.importingredientRepository
      .createQueryBuilder('importingredient')
      .where('importingredient.date = :startDate', { startDate })
      .getMany();

    const importIngredientsEnd = await this.importingredientRepository
      .createQueryBuilder('importingredient')
      .where('importingredient.date = :endDate', { endDate })
      .getMany();

    const totalExpenditureStartDate = importIngredientsStart.reduce(
      (sum, importIngredient) => sum + importIngredient.total,
      0,
    );

    const totalExpenditureEndDate = importIngredientsEnd.reduce(
      (sum, importIngredient) => sum + importIngredient.total,
      0,
    );

    // const totalExpenditure =
    //   totalExpenditureStartDate + totalExpenditureEndDate;

    return {
      startDate,
      endDate,
      // totalExpenditure,
      totalExpenditureStartDate,
      totalExpenditureEndDate,
    };
  }

  async getStartAndEndDate(): Promise<{ startDate: Date; endDate: Date }> {
    const latestImport = await this.importingredientRepository
      .createQueryBuilder('importingredient')
      .orderBy('importingredient.date', 'DESC')
      .getOne();

    const secondLatestImport = await this.importingredientRepository
      .createQueryBuilder('importingredient')
      .orderBy('importingredient.date', 'DESC')
      .skip(1)
      .take(1)
      .getOne();

    const startDate = secondLatestImport ? secondLatestImport.date : new Date();
    const endDate = latestImport ? latestImport.date : new Date();

    return { startDate, endDate };
  }
}
