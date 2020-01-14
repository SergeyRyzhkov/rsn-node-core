
import * as transformer from 'class-transformer';

export default class ClassTransform {

  public static jsonStringToClass = (jsonString, classType: any) => {
    return transformer.deserialize(classType, jsonString);
  }

  public static plainToClass = (jsonObject, classType: any) => {
    return transformer.plainToClass(classType, jsonObject);
  }

  public static plainToClassOne = (jsonObject, classType: any) => {
    const temp = ClassTransform.plainToClass(jsonObject, classType);
    return temp && Array.isArray(temp) && temp.length > 0 ? temp[0] : temp
  }

  public static plainToClassInstanceOne<T> (jsonObject, classType: new () => T): T {
    if (Array.isArray(jsonObject)) {
      const result = this.plainArrayToClassInstanceArray(jsonObject as [], classType);
      return result && result.length > 0 ? result[0] : null;
    } else {
      const newInstance: T = new classType();
      return transformer.plainToClassFromExist(newInstance, jsonObject);
    }
  }

  public static plainArrayToClassInstanceArray<T> (jsonObject: [], classType: new () => T): T[] {
    return jsonObject.map((obj) => {
      const newInstance: T = new classType();
      return transformer.plainToClassFromExist(newInstance, obj);
    })
  }

  public static classToClass<T> (fromClass, toClassType: new () => T): T {
    const plain = transformer.classToPlain(fromClass);
    return this.plainToClassInstanceOne<T>(plain, toClassType);
  }
}




