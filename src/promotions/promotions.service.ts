import {
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  CreatePromotionDto,
  PromotionType,
  QueryPromotionDto,
} from './dto/create-promotion.dto';
import { UpdatePromotionDto } from './dto/update-promotion.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Promotion } from './entities/promotion.entity';
import { Like, Repository } from 'typeorm';
import { ReceiptPromotion } from 'src/receipt-promotions/entities/receipt-promotion.entity';

@Injectable()
export class PromotionsService {
  constructor(
    @InjectRepository(Promotion)
    private readonly promotionRepository: Repository<Promotion>,

    @InjectRepository(ReceiptPromotion)
    private readonly receiptPromotionRepository: Repository<ReceiptPromotion>,
  ) {}

  async create(createPromotionDto: CreatePromotionDto): Promise<Promotion> {
    const { promotionType, ...promotionDetails } = createPromotionDto;

    const promotion = this.promotionRepository.create({
      ...promotionDetails,
      promotionType,
      discountValue:
        promotionType === PromotionType.DISCOUNT_PRICE ||
        promotionType === PromotionType.USE_POINTS ||
        PromotionType.DISCOUNT_PERCENTAGE
          ? promotionDetails.discountValue
          : null,
      conditionQuantity: promotionDetails.conditionQuantity ?? null,
      buyProductId:
        promotionType === PromotionType.BUY_ONE_GET_ONE
          ? promotionDetails.buyProductId
          : null,
      freeProductId:
        promotionType === PromotionType.BUY_ONE_GET_ONE
          ? promotionDetails.freeProductId
          : null,
      conditionValue1: promotionDetails.conditionValue1 ?? null,
      conditionValue2: promotionDetails.conditionValue2 ?? null,
      endDate: promotionDetails.noEndDate ? null : promotionDetails.endDate,
      promotionDescription: promotionDetails.promotionDescription ?? null,
      promotionForStore: promotionDetails.promotionForStore,
      promotionCanUseManyTimes: promotionDetails.promotionCanUseManyTimes,
    });

    return this.promotionRepository.save(promotion);
  }

  findAll() {
    try {
      return this.promotionRepository.find();
    } catch (error) {
      throw new HttpException(
        'Failed to find promotions',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
  async findAllPromotionsUsageByDateRange(startDate?: Date, endDate?: Date) {
    try {
      // Determine the minimum and maximum dates if not provided
      if (!startDate || !endDate) {
        const dateRange = await this.receiptPromotionRepository
          .createQueryBuilder('receiptPromotion')
          .select('MIN(receiptPromotion.date)', 'minDate')
          .addSelect('MAX(receiptPromotion.date)', 'maxDate')
          .getRawOne();

        startDate = startDate || new Date(dateRange.minDate);
        endDate = endDate || new Date(dateRange.maxDate);
        endDate.setDate(endDate.getDate() + 1); // Add one day to endDate
      }

      const promotionsUsage = await this.receiptPromotionRepository
        .createQueryBuilder('receiptPromotion')
        .leftJoinAndSelect('receiptPromotion.promotion', 'promotion')
        .where('receiptPromotion.date BETWEEN :startDate AND :endDate', {
          startDate,
          endDate,
        })
        .getMany();

      const allPromotions = await this.promotionRepository.find();

      const promotionSummary = promotionsUsage.reduce(
        (summary, receiptPromotion) => {
          const promotionName = receiptPromotion.promotion.promotionName;
          if (!summary[promotionName]) {
            summary[promotionName] = {
              usageCount: 0,
              totalDiscount: 0,
            };
          }
          summary[promotionName].usageCount += 1;
          summary[promotionName].totalDiscount += Number(
            receiptPromotion.discount,
          );
          return summary;
        },
        {},
      );

      allPromotions.forEach((promotion) => {
        if (!promotionSummary[promotion.promotionName]) {
          promotionSummary[promotion.promotionName] = {
            usageCount: 0,
            totalDiscount: 0,
          };
        }
      });

      const result = Object.keys(promotionSummary).map((promotionName) => ({
        promotionName,
        usageCount: promotionSummary[promotionName].usageCount,
        totalDiscount: promotionSummary[promotionName].totalDiscount,
      }));

      return {
        promotionsUsage: result,
      };
    } catch (error) {
      throw new HttpException(
        'Failed to find promotions usage',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  findOne(id: number) {
    try {
      return this.promotionRepository.findOne({ where: { promotionId: id } });
    } catch (error) {
      throw new HttpException(
        'Failed to find promotion',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async update(
    id: number,
    updatePromotionDto: UpdatePromotionDto,
  ): Promise<Promotion> {
    // Fetch the current promotion
    const currentPromotion = await this.promotionRepository.findOne({
      where: { promotionId: id },
    });

    if (!currentPromotion) {
      throw new NotFoundException(`Promotion with ID ${id} not found`);
    }

    // Check if the type or end date has changed
    const typeChanged =
      currentPromotion.promotionType !== updatePromotionDto.promotionType;
    const endDateChanged =
      currentPromotion.endDate !== updatePromotionDto.endDate;

    if (typeChanged || endDateChanged) {
      // Soft remove the current promotion
      await this.promotionRepository.softRemove(currentPromotion);

      // Create a new promotion with the updated data
      const newPromotion = this.promotionRepository.create(updatePromotionDto);
      return this.promotionRepository.save(newPromotion);
    } else {
      // Update the existing promotion
      await this.promotionRepository.update(id, updatePromotionDto);
      return this.promotionRepository.findOne({ where: { promotionId: id } });
    }
  }

  async remove(id: number) {
    try {
      const promotion = await this.promotionRepository.findOne({
        where: { promotionId: id },
      });

      if (!promotion) {
        throw new NotFoundException(`Promotion with ID ${id} not found`);
      }

      await this.promotionRepository.softRemove(promotion);
    } catch (error) {
      throw new HttpException(
        'Failed to delete promotion',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async findByCriteria(query: QueryPromotionDto): Promise<Promotion[]> {
    const queryBuilder =
      this.promotionRepository.createQueryBuilder('promotion');

    if (query.promotionName) {
      queryBuilder.andWhere('promotion.promotionName LIKE :promotionName', {
        promotionName: `%${query.promotionName}%`,
      });
    }

    if (query.promotionType) {
      queryBuilder.andWhere('promotion.promotionType = :promotionType', {
        promotionType: query.promotionType,
      });
    }

    if (query.startDate) {
      queryBuilder.andWhere('promotion.startDate >= :startDate', {
        startDate: query.startDate,
      });
    }

    if (query.endDate) {
      queryBuilder.andWhere('promotion.endDate <= :endDate', {
        endDate: query.endDate,
      });
    }

    if (query.discountValue) {
      queryBuilder.andWhere('promotion.discountValue = :discountValue', {
        discountValue: query.discountValue,
      });
    }

    if (query.conditionQuantity) {
      queryBuilder.andWhere(
        'promotion.conditionQuantity = :conditionQuantity',
        { conditionQuantity: query.conditionQuantity },
      );
    }

    return queryBuilder.getMany();
  }

  // getPromotionsPaginate
  async getPromotionsPaginate(search: string, page: number, limit: number) {
    const [result, total] = await this.promotionRepository.findAndCount({
      where: [
        { promotionName: Like(`%${search}%`) },
        { promotionType: Like(`%${search}%`) },
      ],
      take: limit,
      skip: (page - 1) * limit,
    });

    return {
      data: result,
      total,
      page,
      limit,
    };
  }
  // get promotion by typ

  async getPromotionByType(promotionForStore: string) {
    return this.promotionRepository.find({ where: { promotionForStore } });
  }
}
