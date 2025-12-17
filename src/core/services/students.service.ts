import { Injectable } from '@nestjs/common';
import { log } from 'console';
import { hash } from 'bcrypt';
import {
  Class,
  Gender,
  Prisma,
  Rank,
  student,
  StudentClasses,
  StudentForm,
} from '@prisma/client';
import { retry } from 'rxjs';
import { PrismaService } from 'src/infra/database/prisma.service';
import {
  entityAlreadyExistsError,
  entityDoesNotExists,
  notEnoughPermissions,
  prohibitedAction,
} from 'src/infra/utils/errors';
import { string } from 'zod';
import { Ranking, getNextRank } from 'src/infra/interfaces/ranks';
interface specialStudent extends student{
    nextRank: String,
    nextRating: number,
    form:StudentForm,
    needed:number,
    excess:number,
    presence:number
}
interface QueryStudentFilters {
  query?: string;
  maxAge?: number;
  minAge?: number;
  CPF?: string;
  email?: string;
  Presence?: number; //from studentForm
  Rank?: Rank; // from studentForm
  class?: string; //the class id from studentClasses relationship
}

interface genericPrivateStudentReturn {
  student: {
    nickname: string;
    email: string;
    personal: {
      name: string;
      CPF: string;
      contact: string;
      birthDate: Date;
      gender: Gender;
    };
    createdAt: Date;
    form: StudentForm;
    classes: Class[];
  };
}

interface genericStudentReturn {
  student: {
    nickname: string;
    email: string;
    personal: {
      name: string;
      CPF: string;
      contact: string;
      birthDate: Date;
      gender: Gender;
    };
    createdAt: Date;
    form: StudentForm;
  };
}
@Injectable()
export class studentServices {
  constructor(private _prisma: PrismaService) {}

  private validateStudentAge(birthDate: Date, requiredAge: number): boolean {
    const today = new Date();
    const birthDateTime = new Date(birthDate);

    // Calculate age
    let age = today.getFullYear() - birthDateTime.getFullYear();

    // Adjust age if birthday hasn't occurred this year
    const monthDiff = today.getMonth() - birthDateTime.getMonth();
    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birthDateTime.getDate())
    ) {
      age--;
    }

    return age >= requiredAge;
  }

  async create(
    data: Prisma.studentCreateInput,
    formData: Prisma.StudentFormUncheckedCreateInput,
    classId?: string[],
  ): Promise<genericPrivateStudentReturn> {
    const theresAnyStudentWithTheSameUniqueValues =
      await this._prisma.student.findFirst({
        where: {
          OR: [{ email: data.email }, { CPF: data.CPF }],
        },
      });

    //Retorna um erro se as informações do responsável nao forem informadas
    if (
      !this.validateStudentAge(new Date(data.birthDate), 18) &&
      !data.parentContact
    ) {
      throw new prohibitedAction(
        'A idade do estudante deve estar no período aceito pela turma',
      );
    }

    if (theresAnyStudentWithTheSameUniqueValues) {
      throw new entityAlreadyExistsError();
    }

    log('Creating student with data:', data, 'and formData:', formData);
    const _student = await this._prisma.student.create({
      data,
    });

    log('Student created in database:', _student);
    const _studenForm = await this._prisma.studentForm.create({
      data: {
        Rank: formData.Rank,
        Comments: formData.Comments,
        Presence: formData.Presence,
        studentId: _student.id,
        Rating: formData.Rating,
        Allergies: formData.Allergies,
        Health_issues: formData.Health_issues,
        IFCE_student_registration: formData.IFCE_student_registration,
        Medication_usage: formData.Medication_usage,
        userId: formData.userId,
      },
    });
    var __classes: Class[] = [];
    for (let i = 0; i < classId.length; i++) {
      const doesTheClassExists = await this._prisma.class.findUnique({
        where: {
          id: classId[i],
        },
      });
      if (!doesTheClassExists) {
        throw new entityDoesNotExists();
      }
      await this._prisma.studentClasses.create({
        data: {
          classId: classId[i],
          studentId: _student.id,
        },
      });

      __classes.push(doesTheClassExists);
    }

    return {
      student: {
        nickname: _student.nickname,
        email: _student.email,
        personal: {
          gender: _student.gender,
          name: _student.name,
          CPF: _student.CPF,
          contact: _student.Contact,
          birthDate: _student.birthDate,
        },
        createdAt: _student.createdAt,
        form: _studenForm,
        classes: __classes,
      },
    };
  }

  async delete(id: string): Promise<student> {
    const doesTheStudentExists = await this._prisma.student.findUnique({
      where: {
        id,
      },
    });

    if (!doesTheStudentExists) {
      throw new entityDoesNotExists();
    }

    const _deleteForm = await this._prisma.studentForm.delete({
      where: {
        studentId: id,
      },
    });

    const deleteStudent = await this._prisma.student.delete({
      where: {
        id,
      },
    });

    return deleteStudent;
  }

  async updatePersonal(
    data: Prisma.studentUpdateInput,
    id: string,
  ): Promise<student> {
    const { CPF, Contact, birthDate, email, name, nickname } = data;

    const _studentpersonalUpdate = await this._prisma.student.update({
      where: {
        id,
      },
      data,
    });

    return _studentpersonalUpdate;
  }

  async studentFormUpdate(
    formData: Prisma.StudentFormUpdateInput,
    id: string,
  ): Promise<StudentForm> {
    const { Comments, Presence, Rank, Rating } = formData;

    const updateFormdata = await this._prisma.studentForm.update({
      where: {
        studentId: id,
      },
      data: formData,
    });

    return updateFormdata;
  }

  async getStudent(id: string) {
    const doesTheStudentExists = await this._prisma.student.findUnique({
      where: {
        id,
      },
    });

    if (!doesTheStudentExists) {
      throw new entityDoesNotExists();
    }

    const {
      CPF,
      Contact,
      birthDate,
      createdAt,
      email,
      name,
      nickname,
      parentContact,
      parentName,
    } = doesTheStudentExists;
    console.log('but got here');
    const studentForm = await this._prisma.studentForm.findUnique({
      where: {
        studentId: id,
      },
    });

    const __classes: Class[] = [];
    const studentClasses = await this._prisma.studentClasses.findMany({
      where: {
        studentId: id,
      },
    });

    for (let i = 0; i < studentClasses.length; i++) {
      const classInfo = await this._prisma.class.findUnique({
        where: {
          id: studentClasses[i].classId,
        },
      });
      __classes.push(classInfo);
    }

    console.log(doesTheStudentExists);
    return {
      student: {
        nickname: nickname,
        email: email,
        personal: {
          name: name,
          CPF: CPF,
          contact: Contact,
          birthDate: birthDate,
          gender: doesTheStudentExists.gender,
          age: Math.floor(
            (new Date().getTime() - new Date(birthDate).getTime()) /
              (1000 * 60 * 60 * 24 * 365.25),
          ),
        },
        parents: {
          parentName: parentName,
          parentContact: parentContact,
        },
        classes: __classes, //TODO: implementar retorno de classes
        createdAt: createdAt,
        form: studentForm,
      },
    };
  }

  async joinClass(studentId: string, classId: string): Promise<StudentClasses> {
    const doesTheStudentExists = await this._prisma.student.findUnique({
      where: {
        id: studentId,
      },
    });

    if (!doesTheStudentExists) {
      throw new entityDoesNotExists();
    }

    const doesTheClassExists = await this._prisma.class.findUnique({
      where: {
        id: classId,
      },
    });

    if (!doesTheClassExists) {
      throw new entityDoesNotExists();
    }

    if (
      !this.validateStudentAge(
        doesTheStudentExists.birthDate,
        doesTheClassExists.minAge,
      )
    ) {
      throw new prohibitedAction(
        'O aluno só pode entrar em turmas configuradas para a sua faixa de idade',
      );
    }
    return await this._prisma.studentClasses.create({
      data: {
        classId,
        studentId,
      },
    });
  }

  async leaveClass(
    studentId: string,
    classId: string,
  ): Promise<Prisma.BatchPayload> {
    const doesTheStudentExists = await this._prisma.student.findUnique({
      where: {
        id: studentId,
      },
    });

    if (!doesTheStudentExists) {
      throw new entityDoesNotExists();
    }

    const doesTheClassExists = await this._prisma.class.findUnique({
      where: {
        id: classId,
      },
    });

    if (!doesTheClassExists) {
      throw new entityDoesNotExists();
    }

    const relationshipExists = await this._prisma.studentClasses.findFirst({
      where: {
        classId,
        studentId,
      },
    });

    if (!relationshipExists) {
      throw new entityDoesNotExists();
    }

    return await this._prisma.studentClasses.deleteMany({
      where: {
        classId,
        studentId,
      },
    });
  }

  async queryStudent(
    filters?: QueryStudentFilters,
  ): Promise<genericStudentReturn[]> {
    const now = new Date();

    const students = await this._prisma.student.findMany({
      where: {
        AND: [
          // Text search filters
          filters?.query
            ? {
                OR: [
                  { name: { contains: filters.query, mode: 'insensitive' } },
                  { email: { contains: filters.query, mode: 'insensitive' } },
                  {
                    nickname: { contains: filters.query, mode: 'insensitive' },
                  },
                ],
              }
            : {},

          // Exact match filters
          filters?.CPF ? { CPF: filters.CPF } : {},
          filters?.email ? { email: filters.email } : {},

          // Age filter using birthDate
          filters?.minAge || filters?.maxAge
            ? {
                birthDate: {
                  // If maxAge is 20, person must be born after (now - 20 years)
                  gte: filters?.maxAge
                    ? new Date(
                        now.getFullYear() - filters.maxAge - 1,
                        now.getMonth(),
                        now.getDate(),
                      )
                    : undefined,
                  // If minAge is 10, person must be born before (now - 10 years)
                  lte: filters?.minAge
                    ? new Date(
                        now.getFullYear() - filters.minAge,
                        now.getMonth(),
                        now.getDate(),
                      )
                    : undefined,
                },
              }
            : {},

          // Class relationship filter
          filters?.class
            ? {
                classes: {
                  some: {
                    classId: filters.class,
                  },
                },
              }
            : {},
        ],
      },
      include: {
        formData: true,
        classes: true,
      },
    });

    // Additional filtering for form-related filters that might be complex for Prisma
    let filteredStudents = students;

    if (filters?.Presence) {
      filteredStudents = filteredStudents.filter(
        (student) => student.formData?.Presence === filters.Presence,
      );
    }

    if (filters?.Rank) {
      filteredStudents = filteredStudents.filter(
        (student) => student.formData?.Rank === filters.Rank,
      );
    }

    // Map to return format
    return filteredStudents.map((student) => ({
      student: {
        id: student.id,
        nickname: student.nickname,
        email: student.email,
        personal: {
          name: student.name,
          CPF: student.CPF,
          contact: student.Contact,
          birthDate: student.birthDate,
          gender: student.gender,
          rank: student.formData?.Rank,
          comments: student.formData?.Comments,
          presence: student.formData?.Presence,
          rating: student.formData?.Rating,
        },
        createdAt: student.createdAt,
        form: student.formData,
      },
    }));
  }

  async promoteStudentToCoach(
    studentId: string,
    password: string,
    promoterId: string,
  ) {
    const doesTheAdminExists = await this._prisma.user.findUnique({
      where: {
        id: promoterId,
      },
    });

    if (!doesTheAdminExists || doesTheAdminExists.role !== 'ADMIN') {
      throw new notEnoughPermissions();
    }

    const doesTheStudentExists = await this._prisma.student.findUnique({
      where: {
        id: studentId,
      },
    });

    if (!doesTheStudentExists) {
      throw new entityDoesNotExists();
    }

    const formData = await this._prisma.studentForm.findUnique({
      where: {
        studentId: studentId,
      },
    });

    if (!formData) {
      throw new prohibitedAction('Student does not have a valid student form');
    }

    const { email, name } = doesTheStudentExists;
    const _theresAlreadyAnUserWithThisUserName =
      await this._prisma.user.findUnique({
        where: {
          name,
        },
      });

    if (_theresAlreadyAnUserWithThisUserName) {
      throw new entityAlreadyExistsError();
    }

    const __password = await hash(password, 9);

    const __coachUser = await this._prisma.user.create({
      data: {
        email: email,
        name: name,
        password: __password,
        role: 'USER',
      },
    });

    if (!__coachUser) {
      throw new prohibitedAction('Could not promote the student to coach');
    }

    const __updateFormData = await this._prisma.studentForm.update({
      where: {
        studentId,
      },
      data: {
        userId: __coachUser.id,
      },
    });

    return {
      new_user: __coachUser,
      student_form: __updateFormData,
      student: doesTheStudentExists,
    };
  }

  async promoteStudentRank(studentId: string,promoterId: string,){
    // Verify student exists
    const doesTheStudentExists = await this._prisma.student.findUnique({
      where: {
        id: studentId,
      },
    });

    if (!doesTheStudentExists) {
      throw new entityDoesNotExists();
    }

    // Get student form with current rank
    const studentForm = await this._prisma.studentForm.findUnique({
      where: {
        studentId,
      },
    });

    if (!studentForm) {
      throw new entityDoesNotExists();
    }

    const { Presence, Rank: currentRank, Rating } = studentForm;

    // Get available degrees for current rank
    const currentRankKey = String(currentRank);
    const currentRankDegrees = Ranking[currentRankKey] || [0];
    const maxDegreeCurrentRank = Math.max(...currentRankDegrees);
    const currentDegree = Rating || 0;

    // Check if current degree is at maximum
    if (currentDegree < maxDegreeCurrentRank) {
      // Just increment the degree
      // Get promotion config for next rank
      const config = await this._prisma.promotion_config.findFirst({
        where: {
          ref_rank: currentRank,
        },
      });
      if(studentForm.Presence < config.needed_frequency){
          throw new prohibitedAction("Não possui presença o suficiente para promover o grau; Nescessário"+config.needed_frequency+" atual:"+studentForm.Presence)
      }
      const updatedForm = await this._prisma.studentForm.update({
        where: {
          studentId,
        },
        data: {
          Rating: currentDegree + 1,
          Presence: 0, // Reset frequency counter after progression
        },
      });
      const promoteData = await this._prisma.promotion_registry.create({
        data:{
          from_rank: currentRank,
          to_rank:currentRank,
          coach_id:promoterId,
          student_id:studentId
        }
      })
      return {updatedForm,promoteData};
    }

    // If degree is at maximum, promote to next rank
    const nextRank = getNextRank(String(currentRank));

    if (!nextRank) {
      throw new prohibitedAction(
        'Este estudante já atingiu o rank máximo (máximo grau de sua faixa)',
      );
    }

    // Get promotion config for next rank
    const config = await this._prisma.promotion_config.findFirst({
      where: {
        ref_rank: nextRank as Rank,
      },
    });

    if (!config) {
      throw new prohibitedAction(
        'Não existe uma configuração de promoção para o próximo rank',
      );
    }

    // Validate frequency requirement for rank promotion
    if (Presence < config.needed_frequency) {
      throw new prohibitedAction(
        `O estudante não possui a frequência necessária para ser promovido de faixa. Frequência atual: ${Presence}, Necessária: ${config.needed_frequency}`,
      );
    }
    //cria um registro de frequencia
    const promoteData = await this._prisma.promotion_registry.create({
      data:{
        from_rank: currentRank,
        to_rank:nextRank as Rank,
        coach_id:promoterId,
        student_id:studentId
      }
    })
    // Update studentForm with next rank, reset degree and presence
    const updatedForm = await this._prisma.studentForm.update({
      where: {
        studentId,
      },
      data: {
        Rank: nextRank as Rank,
        Rating: 0, // Start at degree 0 in new rank
        Presence: 0, // Reset frequency counter
      },
    });

    return {updatedForm, promoteData};
  }

  async getStudentsReadyForPromotion(){
      // 1. Busca todos os formulários com aluno
      const forms = await this._prisma.studentForm.findMany({
        include: { student: true },
      });

      // 2. Busca todas as configurações de promoção
      const promotionConfigs = await this._prisma.promotion_config.findMany();

      // Map para acesso rápido por rank
      const promotionConfigMap = new Map(
        promotionConfigs.map(config => [config.ref_rank, config])
      );

      // Evita duplicação de alunos

      const studentsMap = new Map<string, specialStudent>();

      for (const form of forms) {
        // Segurança
        if (!form.student) continue;
        log(`Checando aluno:${form.student.name}_________________________________________`)
        const currentRank = String(form.Rank);
        const currentRankRecord = Ranking[currentRank]
        
        // 3. Valida se o rank existe
        const degrees = Ranking[currentRank];
        if (!degrees) continue;
        const maxDegree = Math.max(...degrees);
        const currentDegree = form.Rating ?? 0;
        log(currentRankRecord)
        // 4. Só pode promover se estiver no grau máximo
        // if (currentDegree < maxDegree) continue;

        // 5. Obtém próximo rank
        //Só vai buscar o próximo ranking se o grau já estiver no máximo
        var nextRank:string
        if(form.Rating!=currentRankRecord.length){
          nextRank = currentRank
          nextDegree+=1
        }else{
          nextDegree = 0;
          nextRank = getNextRank(currentRank);
        }

        var nextDegree = form.Rating;
        if (!nextRank) continue;
        log(`Ranking Atual:${currentRank};Próximo Ranking:${nextRank}`)

        // 6. Busca configuração do próximo rank
        const config = promotionConfigMap.get(nextRank as Rank);
        if (!config) continue;
        const needed = config.needed_frequency ?? 0;
        const presence = form.Presence ?? 0;
        log("have:"+presence+"; need:"+needed)

        if(form.Rating!=4){
          nextRank = currentRank
          nextDegree+=1
        }else{
          nextDegree=0;
        }
      
        // 7. Regra principal:
        // presença deve ser pelo menos 5 a mais que o necessário
        var excess = presence<needed? presence - needed: 1;

        excess = excess < 0?excess*=-1:excess;

        log("Excesso:"+excess)
        if (excess <= 5) {
          studentsMap.set(form.student.id, {
            ...form.student,
            excess,presence,needed,nextRank,form,nextRating:nextDegree
          });
        }
      }
      const students = Array.from(studentsMap.values())
      return students ;
  }

}
