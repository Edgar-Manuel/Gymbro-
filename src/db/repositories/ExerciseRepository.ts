import { db } from '../schema';
import type { ExerciseKnowledge } from '@/types';

export const ExerciseRepository = {
    async getExerciseById(id: string) {
        return await db.exercises.get(id);
    },

    async getExercisesByMuscleGroup(grupoMuscular: string) {
        return await db.exercises.where('grupoMuscular').equals(grupoMuscular).toArray();
    },

    async getAllExercises() {
        return await db.exercises.toArray();
    },

    async searchExercises(query: string) {
        const allExercises = await db.exercises.toArray();
        return allExercises.filter(ex =>
            ex.nombre.toLowerCase().includes(query.toLowerCase())
        );
    },

    async bulkAddExercises(exercises: ExerciseKnowledge[]) {
        // Exercises are usually static content, so we might not need to sync them back to cloud 
        // unless we have a custom exercise feature. For now, just local.
        return await db.exercises.bulkAdd(exercises);
    }
};
