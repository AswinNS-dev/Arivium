import { supabaseAdmin } from '../config/supabase';
import { AuthenticatedUser } from '../middleware/auth.middleware';

interface Task {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  data?: any;
  created_at: string;
  updated_at: string;
}

class TasksService {
  /**
   * Create a new task for the authenticated user.
   */
  async createTask(user: AuthenticatedUser, payload: { title: string; description?: string; data?: any }) {
    const { title, description, data } = payload;
    const { data: inserted, error } = await supabaseAdmin
      .from('tasks')
      .insert({
        user_id: user.id,
        title,
        description,
        data,
      })
      .single();
    if (error) throw new Error(error.message);
    return inserted as Task;
  }

  /**
   * Retrieve all tasks belonging to the authenticated user.
   */
  async getTasks(user: AuthenticatedUser) {
    const { data, error } = await supabaseAdmin
      .from('tasks')
      .select('*')
      .eq('user_id', user.id);
    if (error) throw new Error(error.message);
    return data as Task[];
  }
}

export default new TasksService();
