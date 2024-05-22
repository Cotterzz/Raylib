define IMPORTANT_WARNING
#####################IMPORTANT!#############################
You must have a terraform.tfvars file with the actual values!
#####################IMPORTANT!#############################

$(1)  # Optionally include additional text passed as an argument
endef

CC = gcc
CFLAGS = -std=c99 -Wall -v
LDFLAGS = -lraylib -lgdi32 -lwinmm
EXE = $(basename $(notdir $(CURDIR)))

# Phony target to ensure it's always run
.PHONY: run clean

all: $(EXE).exe run
	$(info $(call IMPORTANT_WARNING,This is an extra line!))
# Get a list of all C files and replace .c with .o
OBJS := $(patsubst %.c,%.o,$(wildcard $(CURDIR)/*.c))

$(EXE).exe: $(OBJS)
	$(CC) $(CFLAGS) -o $@ $^ $(LDFLAGS)

run: $(EXE).exe
	./$(EXE).exe

clean:
	rm -f $(EXE).exe $(OBJS)