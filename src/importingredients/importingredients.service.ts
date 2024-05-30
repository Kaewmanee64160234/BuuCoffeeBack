import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateImportingredientDto } from './dto/create-importingredient.dto';
import { UpdateImportingredientDto } from './dto/update-importingredient.dto';
import { Importingredient } from './entities/importingredient.entity';
import { Repository } from 'typeorm';
import { Importingredientitem } from 'src/importingredientitems/entities/importingredientitem.entity';
import { Ingredient } from 'src/ingredients/entities/ingredient.entity';
import { User } from 'src/users/entities/user.entity';

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
  ) {}
  async create(createImportingredientDto: CreateImportingredientDto) {
    const user = await this.userRepository.findOneBy({});
    if (!user) {
      throw new Error('User not found');
    }
    const importingredient = new Importingredient();
    importingredient.user = user;
    importingredient.date = createImportingredientDto.date;
    importingredient.discount = createImportingredientDto.discount;
    importingredient.store = createImportingredientDto.store;
    importingredient.total = 0;

    const savedImportingredient = await this.importingredientRepository.save(
      importingredient,
    );

    let total = 0;
    for (const importItemDto of createImportingredientDto.importingredientitem) {
      const ingredient = await this.ingredientRepository.findOneBy({
        IngredientId: importItemDto.ingredientId,
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
      total += importItemDto.pricePerUnit * importItemDto.Quantity;

      await this.importingredientitemRepository.save(importingredientitem);

      // Update the quantity in stock for the ingredient
      ingredient.quantityInStock += importItemDto.Quantity;
      await this.ingredientRepository.save(ingredient);
    }

    savedImportingredient.total = total - savedImportingredient.discount;
    await this.importingredientRepository.save(savedImportingredient);

    return await this.importingredientRepository.findOne({
      where: { importID: savedImportingredient.importID },
      relations: ['importingredientitem'],
    });
  }
  findAll() {
    return `This action returns all importingredients`;
  }

  findOne(id: number) {
    return `This action returns a #${id} importingredient`;
  }

  update(id: number, updateImportingredientDto: UpdateImportingredientDto) {
    return `This action updates a #${id} importingredient`;
  }

  remove(id: number) {
    return `This action removes a #${id} importingredient`;
  }
}
