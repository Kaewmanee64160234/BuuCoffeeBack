import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Checkingredient } from 'src/checkingredients/entities/checkingredient.entity';
import { Checkingredientitem } from 'src/checkingredientitems/entities/checkingredientitem.entity';
import { Ingredient } from 'src/ingredients/entities/ingredient.entity';
import { User } from 'src/users/entities/user.entity';
import { CreateCheckingredientDto } from './dto/create-checkingredient.dto';

@Injectable()
export class CheckingredientsService {
  constructor(
    @InjectRepository(Checkingredient)
    private checkingredientRepository: Repository<Checkingredient>,
    @InjectRepository(Checkingredientitem)
    private checkingredientitemRepository: Repository<Checkingredientitem>,
    @InjectRepository(Ingredient)
    private ingredientRepository: Repository<Ingredient>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}
  async create(createCheckingredientDto: CreateCheckingredientDto) {
    const user = await this.userRepository.findOneBy({
      userId: createCheckingredientDto.userId,
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const checkingredient = new Checkingredient();
    checkingredient.user = user;
    checkingredient.date = createCheckingredientDto.date;
    checkingredient.checkDescription =
      createCheckingredientDto.checkDescription;
    checkingredient.actionType = createCheckingredientDto.actionType;

    const savedCheckingredient = await this.checkingredientRepository.save(
      checkingredient,
    );

    for (const itemDto of createCheckingredientDto.checkingredientitems) {
      const ingredient = await this.ingredientRepository.findOneBy({
        ingredientId: itemDto.ingredientId,
      });

      if (!ingredient) {
        throw new NotFoundException(
          `Ingredient with ID ${itemDto.ingredientId} not found`,
        );
      }

      const checkingredientitem = new Checkingredientitem();
      checkingredientitem.checkingredient = savedCheckingredient;
      checkingredientitem.ingredient = ingredient;
      checkingredientitem.UsedQuantity = itemDto.UsedQuantity;

      await this.checkingredientitemRepository.save(checkingredientitem);

      // Update
      if (createCheckingredientDto.actionType === 'issuing') {
        ingredient.ingredientQuantityInStock -= itemDto.UsedQuantity;
      } else if (createCheckingredientDto.actionType === 'check') {
        ingredient.ingredientQuantityInStock = itemDto.UsedQuantity;
      }
      await this.ingredientRepository.save(ingredient);
    }

    return await this.checkingredientRepository.findOne({
      where: {
        CheckID: savedCheckingredient.CheckID,
      },
      relations: ['checkingredientitem'],
    });
  }

  async findAll(): Promise<Checkingredient[]> {
    return await this.checkingredientRepository.find({
      relations: [
        'checkingredientitem',
        'user',
        'checkingredientitem.ingredient',
      ],
    });
  }
  findOne(id: number) {
    return `This action returns a #${id} checkingredient`;
  }

  remove(id: number) {
    return `This action removes a #${id} checkingredient`;
  }
}
