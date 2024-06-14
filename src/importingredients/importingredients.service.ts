import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateImportingredientDto } from './dto/create-importingredient.dto';
import { Importingredient } from './entities/importingredient.entity';
import { Repository, LessThanOrEqual, MoreThanOrEqual } from 'typeorm';
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

    const savedImportingredient = await this.importingredientRepository.save(
      importingredient,
    );

    // let total = 0;
    for (const importItemDto of createImportingredientDto.importingredientitem) {
      const ingredient = await this.ingredientRepository.findOneBy({
        ingredientId: importItemDto.ingredientId,
      });
      if (!ingredient) {
        throw new Error(
          `Ingredient with ID ${importItemDto.ingredientId} not found`,
        );
      }

      const importingredientitem = new Importingredientitem();
      importingredientitem.importingredient = savedImportingredient;
      importingredientitem.ingredient = ingredient;
      importingredientitem.pricePerUnit = importItemDto.pricePerUnit;
      importingredientitem.Quantity = importItemDto.Quantity;
      // total += importItemDto.pricePerUnit * importItemDto.Quantity;
      await this.importingredientitemRepository.save(importingredientitem);

      // Update the quantity in stock for the ingredient
      ingredient.ingredientQuantityInStock += importItemDto.Quantity;
      await this.ingredientRepository.save(ingredient);
    }

    // savedImportingredient.total = total - savedImportingredient.discount;
    await this.importingredientRepository.save(savedImportingredient);

    return await this.importingredientRepository.findOne({
      where: { importID: savedImportingredient.importID },
      relations: ['importingredientitem'],
    });
  }

  findAll() {
    try {
      return this.importingredientRepository.find({
        relations: ['importingredientitem', 'user'],
      });
    } catch (error) {
      console.error(error);
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
  async getRevenueByPeriod(
    startDate: Date,
    endDate: Date,
  ): Promise<{ receipts: any[]; totalRevenue: number }> {
    const receipts = await this.recieptRepository
      .createQueryBuilder('reciept')
      .select('reciept.createdDate AS date')
      .addSelect('reciept.receiptNetPrice', 'receiptNetPrice')
      .where('reciept.createdDate BETWEEN :startDate AND :endDate', {
        startDate,
        endDate,
      })
      .getRawMany();

    const totalRevenue = receipts.reduce(
      (sum, receipt) => sum + receipt.receiptNetPrice,
      0,
    );

    return { receipts, totalRevenue };
  }

  async getExpenditureByPeriod(
    startDate: Date,
    endDate: Date,
  ): Promise<{ startDate: Date; endDate: Date; totalExpenditure: number }> {
    const importIngredients = await this.importingredientRepository
      .createQueryBuilder('importingredient')
      .where('importingredient.date = :endDate', { endDate })
      .getMany();

    const totalExpenditure = importIngredients.reduce(
      (sum, importIngredient) => sum + importIngredient.total,
      0,
    );

    return { startDate, endDate, totalExpenditure };
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
