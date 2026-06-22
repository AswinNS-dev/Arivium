"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const supabase_1 = require("../config/supabase");
class TasksService {
    /**
     * Create a new task for the authenticated user.
     */
    async createTask(user, payload) {
        const { title, description, data } = payload;
        const { data: inserted, error } = await supabase_1.supabaseAdmin
            .from('tasks')
            .insert({
            user_id: user.id,
            title,
            description,
            data,
        })
            .single();
        if (error)
            throw new Error(error.message);
        return inserted;
    }
    /**
     * Retrieve all tasks belonging to the authenticated user.
     */
    async getTasks(user) {
        const { data, error } = await supabase_1.supabaseAdmin
            .from('tasks')
            .select('*')
            .eq('user_id', user.id);
        if (error)
            throw new Error(error.message);
        return data;
    }
}
exports.default = new TasksService();
