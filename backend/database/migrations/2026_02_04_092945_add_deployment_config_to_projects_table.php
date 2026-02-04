<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('projects', function (Blueprint $table) {
            $table->string('ssh_host')->nullable();
            $table->string('ssh_port')->default('22');
            $table->string('ssh_user')->nullable();
            $table->text('ssh_password')->nullable(); // Encrypted
            $table->string('ssh_key_path')->nullable();
            $table->string('remote_path')->nullable(); // e.g., /home/user/public_html/myapp
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('projects', function (Blueprint $table) {
            $table->dropColumn(['ssh_host', 'ssh_port', 'ssh_user', 'ssh_password', 'ssh_key_path', 'remote_path']);
        });
    }
};
